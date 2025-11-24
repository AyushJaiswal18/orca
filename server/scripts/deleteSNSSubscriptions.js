import {
  SNSClient,
  ListSubscriptionsByTopicCommand,
  UnsubscribeCommand,
  ListTopicsCommand,
} from "@aws-sdk/client-sns";
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

const SNS_TOPIC_NAME = "OrcaContainerUpdates";

function getSNSClient(region) {
  return new SNSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function deleteSubscriptionsInRegion(region) {
  const snsClient = getSNSClient(region);
  const results = {
    region,
    deleted: [],
    errors: [],
  };

  try {
    // Get topic ARN
    const topicArn = `arn:aws:sns:${region}:${process.env.AWS_ACCOUNT_ID}:${SNS_TOPIC_NAME}`;

    // List all subscriptions for the topic
    const listCommand = new ListSubscriptionsByTopicCommand({
      TopicArn: topicArn,
    });

    const response = await snsClient.send(listCommand);
    const subscriptions = response.Subscriptions || [];

    console.log(`\n📍 Region: ${region}`);
    console.log(`   Found ${subscriptions.length} subscription(s)`);

    for (const subscription of subscriptions) {
      try {
        const unsubscribeCommand = new UnsubscribeCommand({
          SubscriptionArn: subscription.SubscriptionArn,
        });

        await snsClient.send(unsubscribeCommand);
        console.log(`   ✅ Deleted: ${subscription.Endpoint} (${subscription.Protocol})`);
        results.deleted.push({
          endpoint: subscription.Endpoint,
          protocol: subscription.Protocol,
          arn: subscription.SubscriptionArn,
        });
      } catch (error) {
        console.log(`   ❌ Error deleting ${subscription.Endpoint}: ${error.message}`);
        results.errors.push({
          endpoint: subscription.Endpoint,
          error: error.message,
        });
      }
    }

    if (subscriptions.length === 0) {
      console.log(`   ℹ No subscriptions found`);
    }
  } catch (error) {
    if (error.name === "NotFound" || error.message?.includes("does not exist")) {
      console.log(`\n📍 Region: ${region}`);
      console.log(`   ℹ Topic does not exist, skipping`);
    } else {
      console.log(`\n📍 Region: ${region}`);
      console.log(`   ❌ Error: ${error.message}`);
      results.errors.push({
        error: error.message,
      });
    }
  }

  return results;
}

async function deleteAllSubscriptions() {
  console.log("🗑️  Deleting All SNS Subscriptions");
  console.log("=".repeat(70));
  console.log(`\nTopic: ${SNS_TOPIC_NAME}`);
  console.log(`Regions: ${regions.length}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found in environment variables");
    console.error("Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
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
      console.error("❌ Error: Could not detect AWS_ACCOUNT_ID");
      console.error("Please set AWS_ACCOUNT_ID in .env");
      process.exit(1);
    }
  }

  const allResults = [];

  for (const region of regions) {
    const result = await deleteSubscriptionsInRegion(region);
    allResults.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  let totalDeleted = 0;
  let totalErrors = 0;

  allResults.forEach((result) => {
    totalDeleted += result.deleted.length;
    totalErrors += result.errors.length;
  });

  console.log(`\n✅ Deleted: ${totalDeleted} subscription(s)`);
  console.log(`❌ Errors: ${totalErrors} subscription(s)\n`);

  if (totalDeleted > 0) {
    console.log("Deleted subscriptions:");
    allResults.forEach((result) => {
      result.deleted.forEach((sub) => {
        console.log(`  - ${sub.endpoint} (${sub.protocol}) in ${result.region}`);
      });
    });
    console.log();
  }

  console.log("=".repeat(70));
  console.log("\n✅ Deletion complete!\n");
}

deleteAllSubscriptions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

