import {
  ECSClient,
  RegisterTaskDefinitionCommand,
  CreateClusterCommand,
  DescribeClustersCommand,
} from "@aws-sdk/client-ecs";
import {
  SNSClient,
  CreateTopicCommand,
  SubscribeCommand,
  SetTopicAttributesCommand,
  ListSubscriptionsByTopicCommand,
} from "@aws-sdk/client-sns";
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

// Webhook endpoint
const WEBHOOK_URL = "https://api.orca.builtwithayush.tech/api/v1/containers/updates";
const SNS_TOPIC_NAME = "OrcaContainerUpdates";
const ECS_CLUSTER_NAME = "MachineXCluster";

function getECSClient(region) {
  return new ECSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function getSNSClient(region) {
  return new SNSClient({
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

async function createECSCluster(region) {
  const ecsClient = getECSClient(region);

  try {
    // Check if cluster already exists
    const describeCommand = new DescribeClustersCommand({
      clusters: [ECS_CLUSTER_NAME],
    });
    const describeResponse = await ecsClient.send(describeCommand);
    
    if (describeResponse.clusters && describeResponse.clusters.length > 0) {
      const cluster = describeResponse.clusters[0];
      if (cluster.status === "ACTIVE" || cluster.status === "PROVISIONING") {
        return {
          success: true,
          clusterArn: cluster.clusterArn,
          message: "Already exists",
          skipped: true,
        };
      }
    }

    // Create cluster
    const command = new CreateClusterCommand({
      clusterName: ECS_CLUSTER_NAME,
      capacityProviders: ["FARGATE"],
      defaultCapacityProviderStrategy: [
        {
          capacityProvider: "FARGATE",
          weight: 1,
        },
      ],
      settings: [
        {
          name: "containerInsights",
          value: "enabled", // Optional: Enable CloudWatch Container Insights
        },
      ],
    });

    const response = await ecsClient.send(command);
    return {
      success: true,
      clusterArn: response.cluster?.clusterArn,
      message: "Created",
    };
  } catch (error) {
    if (error.name === "ClusterAlreadyExistsException" || error.message?.includes("already exists")) {
      return {
        success: true,
        message: "Already exists",
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

async function createSNSTopic(region) {
  const snsClient = getSNSClient(region);

  try {
    const command = new CreateTopicCommand({
      Name: SNS_TOPIC_NAME,
    });
    const response = await snsClient.send(command);
    return {
      success: true,
      topicArn: response.TopicArn,
      message: "Created",
    };
  } catch (error) {
    if (error.name === "TopicAlreadyExistsException" || error.message?.includes("already exists")) {
      // Topic exists, get its ARN
      const topicArn = `arn:aws:sns:${region}:${process.env.AWS_ACCOUNT_ID}:${SNS_TOPIC_NAME}`;
      return {
        success: true,
        topicArn: topicArn,
        message: "Already exists",
        skipped: true,
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

async function subscribeWebhookToTopic(region, topicArn) {
  const snsClient = getSNSClient(region);

  try {
    // Check if subscription already exists
    const listCommand = new ListSubscriptionsByTopicCommand({
      TopicArn: topicArn,
    });
    const subscriptions = await snsClient.send(listCommand);
    
    const existingSubscription = subscriptions.Subscriptions?.find(
      (sub) => sub.Endpoint === WEBHOOK_URL && sub.Protocol === "https"
    );

    if (existingSubscription) {
      const status = existingSubscription.SubscriptionArn === "PendingConfirmation" 
        ? "pending" 
        : existingSubscription.SubscriptionArn?.includes("PendingConfirmation")
        ? "pending"
        : "confirmed";
      return {
        success: true,
        subscriptionArn: existingSubscription.SubscriptionArn,
        message: status === "pending" ? "Subscription pending confirmation" : "Subscription already exists",
        skipped: status === "confirmed",
        pending: status === "pending",
      };
    }

    // Create new subscription
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: "https",
      Endpoint: WEBHOOK_URL,
    });

    const response = await snsClient.send(command);
    
    // Check if subscription is pending confirmation
    const isPending = response.SubscriptionArn === "PendingConfirmation" || 
                     !response.SubscriptionArn ||
                     response.SubscriptionArn.includes("PendingConfirmation");
    
    return {
      success: true,
      subscriptionArn: response.SubscriptionArn,
      message: isPending ? "Subscription created, pending confirmation" : "Subscribed",
      pending: isPending,
    };
  } catch (error) {
    // If endpoint is unreachable, SNS will still create a pending subscription
    // The endpoint needs to confirm it when SNS sends the confirmation request
    if (error.message?.includes("Unreachable Endpoint")) {
      return {
        success: true,
        subscriptionArn: "PendingConfirmation",
        message: "Subscription initiated - endpoint will receive confirmation request",
        pending: true,
        warning: "SNS cannot verify endpoint reachability. Ensure endpoint is publicly accessible and handles confirmation requests.",
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

async function configureSNSTopic(region, topicArn) {
  const snsClient = getSNSClient(region);

  try {
    // Enable delivery status logging (optional but recommended)
    const command = new SetTopicAttributesCommand({
      TopicArn: topicArn,
      AttributeName: "DeliveryPolicy",
      AttributeValue: JSON.stringify({
        http: {
          defaultHealthyRetryPolicy: {
            minDelayTarget: 20,
            maxDelayTarget: 20,
            numRetries: 3,
            numMaxDelayRetries: 0,
            numNoDelayRetries: 0,
            numMinDelayRetries: 0,
            backoffFunction: "linear",
          },
          disableSubscriptionOverrides: false,
        },
      }),
    });

    await snsClient.send(command);
    return { success: true };
  } catch (error) {
    // Non-critical, just log warning
    console.warn(`  ⚠ Could not configure topic attributes: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function setupRegion(region) {
  const results = {
    region,
    cluster: null,
    taskDefinitions: [],
    snsTopic: null,
    webhookSubscription: null,
  };

  console.log(`\n📍 Region: ${region}`);
  console.log("=".repeat(70));

  // 1. Create ECS Cluster
  console.log(`\n🏗️  Creating ECS Cluster: ${ECS_CLUSTER_NAME}`);
  const clusterResult = await createECSCluster(region);
  
  if (clusterResult.success) {
    if (clusterResult.skipped) {
      console.log(`  ⏭️  Cluster already exists`);
    } else {
      console.log(`  ✅ Cluster created: ${clusterResult.clusterArn}`);
    }
    results.cluster = {
      arn: clusterResult.clusterArn,
      status: clusterResult.skipped ? "skipped" : "created",
    };
  } else {
    console.log(`  ❌ Cluster creation error: ${clusterResult.error}`);
    results.cluster = {
      status: "error",
      error: clusterResult.error,
    };
  }

  // 2. Create task definitions
  console.log("\n📦 Creating Task Definitions:");
  for (const taskDef of taskDefinitions) {
    const logGroupName = `/ecs/${taskDef.family}`;
    
    // Create CloudWatch log group
    if (process.env.AWS_TASK_EXECUTION_ROLE_ARN || process.env.AWS_ACCOUNT_ID) {
      console.log(`  Creating log group: ${logGroupName}...`);
      const logResult = await createCloudWatchLogGroup(region, logGroupName);
      if (!logResult.success && !logResult.skipped) {
        console.log(`  ⚠ Log group creation: ${logResult.error}`);
      }
    }

    // Create task definition
    console.log(`  Creating task definition: ${taskDef.family}...`);
    const taskResult = await createTaskDefinition(region, taskDef);

    if (taskResult.success) {
      console.log(`  ✅ ${taskDef.family} - Created (revision: ${taskResult.revision})`);
      results.taskDefinitions.push({
        family: taskDef.family,
        status: "created",
        revision: taskResult.revision,
      });
    } else if (taskResult.skipped) {
      console.log(`  ⏭️  ${taskDef.family} - Already exists`);
      results.taskDefinitions.push({
        family: taskDef.family,
        status: "skipped",
      });
    } else {
      console.log(`  ❌ ${taskDef.family} - Error: ${taskResult.error}`);
      results.taskDefinitions.push({
        family: taskDef.family,
        status: "error",
        error: taskResult.error,
      });
    }
  }

  // 3. Create SNS Topic
  console.log(`\n📢 Creating SNS Topic: ${SNS_TOPIC_NAME}`);
  const topicResult = await createSNSTopic(region);
  
  if (topicResult.success) {
    console.log(`  ✅ Topic created: ${topicResult.topicArn}`);
    results.snsTopic = {
      arn: topicResult.topicArn,
      status: topicResult.skipped ? "skipped" : "created",
    };

    // Configure topic
    await configureSNSTopic(region, topicResult.topicArn);

    // 4. Subscribe webhook to topic
    console.log(`\n🔗 Subscribing webhook to topic:`);
    console.log(`  Webhook: ${WEBHOOK_URL}`);
    const subResult = await subscribeWebhookToTopic(region, topicResult.topicArn);

    if (subResult.success) {
      if (subResult.skipped) {
        console.log(`  ⏭️  Subscription already exists and confirmed`);
      } else if (subResult.pending) {
        console.log(`  ⏳ Subscription created (pending confirmation)`);
        if (subResult.warning) {
          console.log(`  ⚠ ${subResult.warning}`);
        }
        console.log(`  ℹ SNS will send a confirmation request to: ${WEBHOOK_URL}`);
        console.log(`  ℹ Your endpoint must respond with 200 OK to confirm`);
      } else {
        console.log(`  ✅ Subscription created: ${subResult.subscriptionArn}`);
      }
      results.webhookSubscription = {
        arn: subResult.subscriptionArn,
        status: subResult.skipped ? "skipped" : subResult.pending ? "pending" : "created",
      };
    } else {
      console.log(`  ❌ Subscription error: ${subResult.error}`);
      results.webhookSubscription = {
        status: "error",
        error: subResult.error,
      };
    }
  } else {
    console.log(`  ❌ Topic creation error: ${topicResult.error}`);
    results.snsTopic = {
      status: "error",
      error: topicResult.error,
    };
  }

  return results;
}

async function setupAllRegions() {
  console.log("🚀 Setting Up Task Definitions and SNS Topics for All Regions");
  console.log("=".repeat(70));
  console.log(`\nRegions: ${regions.length}`);
  console.log(`ECS Cluster: ${ECS_CLUSTER_NAME}`);
  console.log(`Task Definitions: ${taskDefinitions.length} (Chrome-Browser, Vivaldi-Browser)`);
  console.log(`SNS Topic: ${SNS_TOPIC_NAME}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Total operations per region: ${1 + taskDefinitions.length + 2} (cluster + task defs + SNS topic + subscription)\n`);

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
      console.warn("Set AWS_ACCOUNT_ID in .env for proper IAM role ARNs and SNS topic ARNs.\n");
    }
  }

  const allResults = [];

  for (const region of regions) {
    try {
      const result = await setupRegion(region);
      allResults.push(result);
    } catch (error) {
      console.error(`\n❌ Fatal error in region ${region}:`, error.message);
      allResults.push({
        region,
        error: error.message,
      });
    }
  }

  // Final Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 FINAL SUMMARY\n");
  console.log("=".repeat(70));

  let totalClustersCreated = 0;
  let totalClustersSkipped = 0;
  let totalTaskDefsCreated = 0;
  let totalTaskDefsSkipped = 0;
  let totalTaskDefsErrors = 0;
  let totalTopicsCreated = 0;
  let totalTopicsSkipped = 0;
  let totalSubscriptionsCreated = 0;
  let totalSubscriptionsSkipped = 0;

  allResults.forEach((result) => {
    if (result.cluster) {
      if (result.cluster.status === "created") totalClustersCreated++;
      else if (result.cluster.status === "skipped") totalClustersSkipped++;
    }
    if (result.taskDefinitions) {
      result.taskDefinitions.forEach((td) => {
        if (td.status === "created") totalTaskDefsCreated++;
        else if (td.status === "skipped") totalTaskDefsSkipped++;
        else if (td.status === "error") totalTaskDefsErrors++;
      });
    }
    if (result.snsTopic) {
      if (result.snsTopic.status === "created") totalTopicsCreated++;
      else if (result.snsTopic.status === "skipped") totalTopicsSkipped++;
    }
    if (result.webhookSubscription) {
      if (result.webhookSubscription.status === "created") totalSubscriptionsCreated++;
      else if (result.webhookSubscription.status === "skipped") totalSubscriptionsSkipped++;
    }
  });

  console.log(`\n✅ ECS Clusters:`);
  console.log(`   Created: ${totalClustersCreated}`);
  console.log(`   Skipped: ${totalClustersSkipped} (already exist)`);

  console.log(`\n✅ Task Definitions:`);
  console.log(`   Created: ${totalTaskDefsCreated}`);
  console.log(`   Skipped: ${totalTaskDefsSkipped} (already exist)`);
  console.log(`   Errors: ${totalTaskDefsErrors}`);

  console.log(`\n✅ SNS Topics:`);
  console.log(`   Created: ${totalTopicsCreated}`);
  console.log(`   Skipped: ${totalTopicsSkipped} (already exist)`);

  console.log(`\n✅ Webhook Subscriptions:`);
  console.log(`   Created: ${totalSubscriptionsCreated}`);
  console.log(`   Skipped: ${totalSubscriptionsSkipped} (already exist)`);

  console.log("\n" + "=".repeat(70));
  console.log("\n⚠ IMPORTANT: Webhook Subscription Confirmation");
  console.log("=".repeat(70));
  console.log("\nSNS will send a confirmation request to your webhook endpoint.");
  console.log("The endpoint must respond with a 200 OK to confirm the subscription.");
  console.log("Your endpoint at /api/v1/containers/updates already handles this automatically.");
  console.log("\nYou can verify subscriptions in AWS Console:");
  console.log("  SNS → Topics → OrcaContainerUpdates → Subscriptions");
  console.log("\n✅ Setup complete!\n");
}

setupAllRegions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

