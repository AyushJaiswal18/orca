import {
  ECSClient,
  RegisterTaskDefinitionCommand,
} from "@aws-sdk/client-ecs";
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

// Task definitions to create
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

function getECSClient(region) {
  return new ECSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function createTaskDefinition(region, taskDef) {
  const ecsClient = getECSClient(region);

  const params = {
    family: taskDef.family,
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    cpu: taskDef.cpu,
    memory: taskDef.memory,
    containerDefinitions: [
      {
        name: taskDef.containerName,
        image: taskDef.image,
        portMappings: [
          {
            containerPort: 6901,
            protocol: "tcp",
          },
        ],
        essential: true,
        // Only add log configuration if execution role is available
        ...(process.env.AWS_TASK_EXECUTION_ROLE_ARN || process.env.AWS_ACCOUNT_ID ? {
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              "awslogs-group": `/ecs/${taskDef.family}`,
              "awslogs-region": region,
              "awslogs-stream-prefix": "ecs",
            },
          },
        } : {}),
      },
    ],
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
    if (error.name === "ClientException" && error.message.includes("already exists")) {
      return {
        success: false,
        error: "Task definition already exists",
        skipped: true,
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

async function createCloudWatchLogGroup(region, logGroupName) {
  try {
    const { CloudWatchLogsClient, CreateLogGroupCommand } = await import("@aws-sdk/client-cloudwatch-logs");
    const logsClient = new CloudWatchLogsClient({
      region: region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new CreateLogGroupCommand({
      logGroupName: logGroupName,
    });

    await logsClient.send(command);
    return true;
  } catch (error) {
    if (error.name === "ResourceAlreadyExistsException") {
      return true; // Log group already exists, that's fine
    }
    // If CloudWatch Logs SDK is not available, just skip log group creation
    if (error.message?.includes("Cannot find module")) {
      console.log(`  ⚠ Skipping log group creation (CloudWatch Logs SDK not available)`);
      return true; // Continue without log group
    }
    console.error(`  ⚠ Could not create log group: ${error.message}`);
    return false;
  }
}

async function createAllTaskDefinitions() {
  console.log("🚀 Creating Task Definitions for Chrome-Browser and Vivaldi-Browser");
  console.log("=".repeat(70));
  console.log(`\nRegions: ${regions.length}`);
  console.log(`Task Definitions: ${taskDefinitions.length}`);
  console.log(`Total operations: ${regions.length * taskDefinitions.length}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found in environment variables");
    console.error("Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
    process.exit(1);
  }

  // Get AWS Account ID if not set
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

  const results = {
    created: [],
    skipped: [],
    errors: [],
  };

  for (const region of regions) {
    console.log(`\n📍 Region: ${region}`);
    console.log("-".repeat(50));

    for (const taskDef of taskDefinitions) {
      const logGroupName = `/ecs/${taskDef.family}`;
      
      // Create CloudWatch log group first
      console.log(`  Creating log group: ${logGroupName}...`);
      await createCloudWatchLogGroup(region, logGroupName);

      // Create task definition
      console.log(`  Creating task definition: ${taskDef.family}...`);
      const result = await createTaskDefinition(region, taskDef);

      if (result.success) {
        console.log(`  ✅ Created: ${taskDef.family} (revision: ${result.revision})`);
        results.created.push({
          region,
          family: taskDef.family,
          revision: result.revision,
        });
      } else if (result.skipped) {
        console.log(`  ⏭️  Skipped: ${taskDef.family} (already exists)`);
        results.skipped.push({
          region,
          family: taskDef.family,
        });
      } else {
        console.log(`  ❌ Error: ${taskDef.family} - ${result.error}`);
        results.errors.push({
          region,
          family: taskDef.family,
          error: result.error,
        });
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 Summary:\n");
  console.log(`✅ Created: ${results.created.length} task definition(s)`);
  console.log(`⏭️  Skipped: ${results.skipped.length} task definition(s) (already exist)`);
  console.log(`❌ Errors: ${results.errors.length} task definition(s)\n`);

  if (results.created.length > 0) {
    console.log("Newly created task definitions:");
    results.created.forEach((r) => {
      console.log(`  - ${r.family} in ${r.region} (revision: ${r.revision})`);
    });
    console.log();
  }

  if (results.skipped.length > 0) {
    console.log("Skipped (already exist):");
    results.skipped.forEach((r) => {
      console.log(`  - ${r.family} in ${r.region}`);
    });
    console.log();
  }

  if (results.errors.length > 0) {
    console.log("Errors:");
    results.errors.forEach((r) => {
      console.log(`  - ${r.family} in ${r.region}: ${r.error}`);
    });
    console.log();
  }

  console.log("=".repeat(70));
  console.log("\n✅ Task definition creation complete!\n");
}

createAllTaskDefinitions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

