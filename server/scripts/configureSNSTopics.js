import {
  SNSClient,
  SetTopicAttributesCommand,
  SubscribeCommand,
  ListSubscriptionsByTopicCommand,
  GetTopicAttributesCommand,
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
const WEBHOOK_URL = "https://api.orca.builtwithayush.tech/api/v1/containers/updates";

function getSNSClient(region) {
  return new SNSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function configureTopicForJSON(region, topicArn) {
  const snsClient = getSNSClient(region);

  try {
    // Configure topic to send JSON format
    // Note: SNS always sends notifications in a specific format, but we can configure
    // the delivery policy and ensure proper content handling
    
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
    return { success: false, error: error.message };
  }
}

async function subscribeWithJSONFormat(region, topicArn) {
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
      // Subscription exists, we'll need to set attributes on it
      // Note: SNS subscriptions don't have a direct "content-type" attribute,
      // but we can configure the endpoint to receive JSON
      return {
        success: true,
        subscriptionArn: existingSubscription.SubscriptionArn,
        message: "Subscription already exists",
        skipped: true,
      };
    }

    // Create new subscription
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: "https",
      Endpoint: WEBHOOK_URL,
      // Set attributes for JSON delivery
      Attributes: {
        // Configure subscription to send raw message delivery (JSON format)
        RawMessageDelivery: "false", // Keep false to get SNS envelope with Message field
      },
    });

    const response = await snsClient.send(command);
    
    return {
      success: true,
      subscriptionArn: response.SubscriptionArn,
      message: "Subscribed with JSON configuration",
      pending: response.SubscriptionArn === "PendingConfirmation",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function configureRegion(region) {
  const results = {
    region,
    topicConfigured: false,
    subscription: null,
  };

  try {
    const topicArn = `arn:aws:sns:${region}:${process.env.AWS_ACCOUNT_ID}:${SNS_TOPIC_NAME}`;
    const snsClient = getSNSClient(region);

    // Verify topic exists
    try {
      const getAttrsCommand = new GetTopicAttributesCommand({
        TopicArn: topicArn,
      });
      await snsClient.send(getAttrsCommand);
    } catch (error) {
      console.log(`\n📍 Region: ${region}`);
      console.log(`   ℹ Topic does not exist, skipping`);
      return results;
    }

    console.log(`\n📍 Region: ${region}`);
    console.log("=".repeat(70));

    // Configure topic
    console.log(`\n⚙️  Configuring Topic: ${SNS_TOPIC_NAME}`);
    const configResult = await configureTopicForJSON(region, topicArn);
    
    if (configResult.success) {
      console.log(`   ✅ Topic configured for JSON delivery`);
      results.topicConfigured = true;
    } else {
      console.log(`   ⚠ Could not configure topic: ${configResult.error}`);
    }

    // Subscribe webhook with JSON format
    console.log(`\n🔗 Subscribing webhook with JSON format:`);
    console.log(`   Webhook: ${WEBHOOK_URL}`);
    const subResult = await subscribeWithJSONFormat(region, topicArn);

    if (subResult.success) {
      if (subResult.skipped) {
        console.log(`   ⏭️  Subscription already exists`);
        console.log(`   ℹ Note: SNS sends notifications with Message field containing JSON`);
        console.log(`   ℹ Your endpoint should parse req.body.Message as JSON string`);
      } else if (subResult.pending) {
        console.log(`   ⏳ Subscription created (pending confirmation)`);
        console.log(`   ℹ SNS will send confirmation request to webhook`);
      } else {
        console.log(`   ✅ Subscription created: ${subResult.subscriptionArn}`);
      }
      results.subscription = {
        arn: subResult.subscriptionArn,
        status: subResult.skipped ? "skipped" : subResult.pending ? "pending" : "created",
      };
    } else {
      console.log(`   ❌ Subscription error: ${subResult.error}`);
      results.subscription = {
        status: "error",
        error: subResult.error,
      };
    }

  } catch (error) {
    console.log(`\n📍 Region: ${region}`);
    console.log(`   ❌ Error: ${error.message}`);
    results.error = error.message;
  }

  return results;
}

async function configureAllTopics() {
  console.log("⚙️  Configuring SNS Topics for JSON Format");
  console.log("=".repeat(70));
  console.log(`\nTopic: ${SNS_TOPIC_NAME}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
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
    const result = await configureRegion(region);
    allResults.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  let totalTopicsConfigured = 0;
  let totalSubscriptionsCreated = 0;
  let totalSubscriptionsSkipped = 0;

  allResults.forEach((result) => {
    if (result.topicConfigured) totalTopicsConfigured++;
    if (result.subscription) {
      if (result.subscription.status === "created") totalSubscriptionsCreated++;
      else if (result.subscription.status === "skipped") totalSubscriptionsSkipped++;
    }
  });

  console.log(`\n✅ Topics Configured: ${totalTopicsConfigured}`);
  console.log(`✅ Subscriptions Created: ${totalSubscriptionsCreated}`);
  console.log(`⏭️  Subscriptions Skipped: ${totalSubscriptionsSkipped} (already exist)\n`);

  console.log("=".repeat(70));
  console.log("\n📝 IMPORTANT NOTES:");
  console.log("=".repeat(70));
  console.log("\nSNS Notification Format:");
  console.log("  SNS always sends notifications in a specific envelope format:");
  console.log("  {");
  console.log('    "Type": "Notification",');
  console.log('    "Message": "<JSON_STRING>",  // Your actual message as JSON string');
  console.log('    "MessageId": "...",');
  console.log('    "Timestamp": "...",');
  console.log('    ...');
  console.log("  }");
  console.log("\nYour endpoint should:");
  console.log("  1. Parse req.body (form-encoded or JSON)");
  console.log("  2. Extract req.body.Message (it's a JSON string)");
  console.log("  3. Parse req.body.Message with JSON.parse()");
  console.log("\nExample:");
  console.log('  const message = JSON.parse(req.body.Message);');
  console.log('  const taskArn = message.detail.taskArn;');
  console.log("\n✅ Configuration complete!\n");
}

configureAllTopics().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

