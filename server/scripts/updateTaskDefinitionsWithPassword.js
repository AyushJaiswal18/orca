import {
  ECSClient,
  RegisterTaskDefinitionCommand,
  DescribeTaskDefinitionCommand,
} from "@aws-sdk/client-ecs";
import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import dotenv from "dotenv";

dotenv.config();

// All regions from the frontend select box
const regions = [
  "ap-south-1", // Mumbai
  "us-east-1", // N Virginia
  "us-east-2", // Ohio
  "us-west-1", // N California
  "ap-northeast-2", // Seoul
  "ap-southeast-1", // Singapore
  "ca-central-1", // Canada
  "eu-west-2", // London
  "eu-west-3", // Paris
  "ap-northeast-3", // Osaka
  "us-west-2", // Oregon
];

// Task definitions to update
const taskDefinitions = [
  {
    family: "Chrome-Browser",
    cpu: "1024",
    memory: "2048",
    image: "kasmweb/chrome:1.14.0",
    containerName: "chrome",
  },
  {
    family: "Vivaldi-Browser",
    cpu: "2048",
    memory: "4096",
    image: "kasmweb/vivaldi:1.14.0",
    containerName: "vivaldi",
  },
];

// VNC Password - can be set via environment variable or use default
const VNC_PASSWORD = process.env.VNC_PASSWORD || "password";

function getECSClient(region) {
  return new ECSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function getCloudWatchLogsClient(region) {
  return new CloudWatchLogsClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function createCloudWatchLogGroup(region, logGroupName) {
  try {
    const logsClient = getCloudWatchLogsClient(region);
    const command = new CreateLogGroupCommand({
      logGroupName: logGroupName,
    });
    await logsClient.send(command);
    return { success: true, message: "Created" };
  } catch (error) {
    if (error.name === "ResourceAlreadyExistsException") {
      return { success: true, message: "Already exists", skipped: true };
    }
    return { success: false, error: error.message };
  }
}

async function getLatestTaskDefinition(region, family) {
  const ecsClient = getECSClient(region);
  
  try {
    const command = new DescribeTaskDefinitionCommand({
      taskDefinition: family,
    });
    const response = await ecsClient.send(command);
    return response.taskDefinition;
  } catch (error) {
    return null;
  }
}

async function updateTaskDefinition(region, taskDef) {
  const ecsClient = getECSClient(region);

  // Get existing task definition to preserve settings
  const existingTaskDef = await getLatestTaskDefinition(region, taskDef.family);

  const containerDefinition = {
    name: taskDef.containerName,
    image: taskDef.image,
    portMappings: [
      {
        containerPort: 6901,
        protocol: "tcp",
      },
    ],
    essential: true,
    environment: [
      {
        name: "VNC_PW",
        value: VNC_PASSWORD,
      },
    ],
  };

  // Add log configuration if execution role is available
  if (process.env.AWS_TASK_EXECUTION_ROLE_ARN || process.env.AWS_ACCOUNT_ID) {
    containerDefinition.logConfiguration = {
      logDriver: "awslogs",
      options: {
        "awslogs-group": `/ecs/${taskDef.family}`,
        "awslogs-region": region,
        "awslogs-stream-prefix": "ecs",
      },
    };
  }

  // If existing task definition exists, preserve other settings
  if (existingTaskDef && existingTaskDef.containerDefinitions && existingTaskDef.containerDefinitions.length > 0) {
    const existingContainer = existingTaskDef.containerDefinitions[0];
    
    // Merge environment variables (add VNC_PW, keep others if any)
    const existingEnv = existingContainer.environment || [];
    const envMap = new Map();
    
    // Add existing environment variables
    existingEnv.forEach((env) => {
      envMap.set(env.name, env.value);
    });
    
    // Add/update VNC_PW
    envMap.set("VNC_PW", VNC_PASSWORD);
    
    containerDefinition.environment = Array.from(envMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  const params = {
    family: taskDef.family,
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    cpu: taskDef.cpu,
    memory: taskDef.memory,
    containerDefinitions: [containerDefinition],
  };

  // Add IAM roles if available
  if (process.env.AWS_TASK_EXECUTION_ROLE_ARN || process.env.AWS_ACCOUNT_ID) {
    params.executionRoleArn = process.env.AWS_TASK_EXECUTION_ROLE_ARN || 
      `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole`;
  }
  
  if (process.env.AWS_TASK_ROLE_ARN || process.env.AWS_ACCOUNT_ID) {
    params.taskRoleArn = process.env.AWS_TASK_ROLE_ARN || 
      `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/ecsTaskRole`;
  }

  try {
    const command = new RegisterTaskDefinitionCommand(params);
    const response = await ecsClient.send(command);
    return {
      success: true,
      taskDefinitionArn: response.taskDefinition?.taskDefinitionArn,
      revision: response.taskDefinition?.revision,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function updateRegion(region) {
  const results = {
    region,
    taskDefinitions: [],
  };

  const regionName = {
    "ap-south-1": "Mumbai",
    "us-east-1": "N Virginia",
    "us-east-2": "Ohio",
    "us-west-1": "N California",
    "ap-northeast-2": "Seoul",
    "ap-southeast-1": "Singapore",
    "ca-central-1": "Canada",
    "eu-west-2": "London",
    "eu-west-3": "Paris",
    "ap-northeast-3": "Osaka",
    "us-west-2": "Oregon",
  }[region];

  console.log(`\n📍 Region: ${region} (${regionName})`);
  console.log("=".repeat(70));

  for (const taskDef of taskDefinitions) {
    const logGroupName = `/ecs/${taskDef.family}`;
    
    // Create CloudWatch log group if needed
    if (process.env.AWS_TASK_EXECUTION_ROLE_ARN || process.env.AWS_ACCOUNT_ID) {
      await createCloudWatchLogGroup(region, logGroupName);
    }

    // Update task definition with VNC_PW environment variable
    console.log(`\n📦 Updating task definition: ${taskDef.family}`);
    console.log(`   Adding VNC_PW environment variable...`);
    
    const result = await updateTaskDefinition(region, taskDef);

    if (result.success) {
      console.log(`   ✅ Updated: ${taskDef.family} (revision: ${result.revision})`);
      results.taskDefinitions.push({
        family: taskDef.family,
        status: "updated",
        revision: result.revision,
      });
    } else {
      console.log(`   ❌ Error: ${taskDef.family} - ${result.error}`);
      results.taskDefinitions.push({
        family: taskDef.family,
        status: "error",
        error: result.error,
      });
    }
  }

  return results;
}

async function updateAllTaskDefinitions() {
  console.log("🔧 Updating Task Definitions with VNC Password");
  console.log("=".repeat(70));
  console.log(`\nVNC Password: ${VNC_PASSWORD}`);
  console.log(`Regions: ${regions.length}`);
  console.log(`Task Definitions: ${taskDefinitions.length} (Chrome-Browser, Vivaldi-Browser)`);
  console.log(`Total operations: ${regions.length * taskDefinitions.length}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found");
    process.exit(1);
  }

  if (!process.env.AWS_ACCOUNT_ID) {
    try {
      const { STSClient, GetCallerIdentityCommand } = await import("@aws-sdk/client-sts");
      const stsClient = new STSClient({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      const command = new GetCallerIdentityCommand({});
      const response = await stsClient.send(command);
      process.env.AWS_ACCOUNT_ID = response.Account;
      console.log(`✓ Detected AWS Account ID: ${process.env.AWS_ACCOUNT_ID}\n`);
    } catch (error) {
      console.warn("⚠ Warning: Could not auto-detect AWS_ACCOUNT_ID.");
      console.warn("Set AWS_ACCOUNT_ID in .env for proper IAM role ARNs.\n");
    }
  }

  const allResults = [];

  for (const region of regions) {
    const result = await updateRegion(region);
    allResults.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  let totalUpdated = 0;
  let totalErrors = 0;

  allResults.forEach((result) => {
    result.taskDefinitions.forEach((td) => {
      if (td.status === "updated") totalUpdated++;
      else if (td.status === "error") totalErrors++;
    });
  });

  console.log(`\n✅ Updated: ${totalUpdated} task definition(s)`);
  console.log(`❌ Errors: ${totalErrors} task definition(s)\n`);

  if (totalUpdated > 0) {
    console.log("Updated task definitions:");
    allResults.forEach((result) => {
      result.taskDefinitions.forEach((td) => {
        if (td.status === "updated") {
          console.log(`  - ${td.family} in ${result.region} (revision: ${td.revision})`);
        }
      });
    });
    console.log();
  }

  console.log("=".repeat(70));
  console.log("\n✅ Task definition update complete!");
  console.log(`\nAll new tasks will use VNC password: ${VNC_PASSWORD}`);
  console.log("Note: Existing running tasks will continue with old configuration.");
  console.log("New tasks will use the updated task definition with VNC_PW.\n");
}

updateAllTaskDefinitions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

