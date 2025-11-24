import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
  ListRulesCommand,
  ListTargetsByRuleCommand,
  RemoveTargetsCommand,
} from "@aws-sdk/client-eventbridge";
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

const RULE_NAME = "OrcaECSTaskStateChange";
const WEBHOOK_URL = "https://api.orca.builtwithayush.tech/api/v1/containers/updates";
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const EVENTBRIDGE_ROLE_ARN = `arn:aws:iam::${AWS_ACCOUNT_ID}:role/EventBridgeHttpInvocationRole`;

function getEventBridgeClient(region) {
  return new EventBridgeClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function createOrUpdateEventBridgeRule(region) {
  const eventBridgeClient = getEventBridgeClient(region);

  try {
    // Check if rule already exists
    const listRulesCommand = new ListRulesCommand({
      NamePrefix: RULE_NAME,
    });
    const existingRules = await eventBridgeClient.send(listRulesCommand);
    const ruleExists = existingRules.Rules?.some((rule) => rule.Name === RULE_NAME);

    // Event pattern for ECS Task State Change
    const eventPattern = {
      source: ["aws.ecs"],
      "detail-type": ["ECS Task State Change"],
    };

    if (ruleExists) {
      // Update existing rule
      console.log(`   ⏭️  Rule already exists, updating...`);
      const putRuleCommand = new PutRuleCommand({
        Name: RULE_NAME,
        EventPattern: JSON.stringify(eventPattern),
        State: "ENABLED",
        Description: "ECS Task State Change events for Orca containers",
      });
      await eventBridgeClient.send(putRuleCommand);
      return { success: true, exists: true };
    } else {
      // Create new rule
      console.log(`   Creating EventBridge rule...`);
      const putRuleCommand = new PutRuleCommand({
        Name: RULE_NAME,
        EventPattern: JSON.stringify(eventPattern),
        State: "ENABLED",
        Description: "ECS Task State Change events for Orca containers",
      });
      await eventBridgeClient.send(putRuleCommand);
      return { success: true, exists: false };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function setupEventBridgeTarget(region) {
  const eventBridgeClient = getEventBridgeClient(region);

  try {
    // Check existing targets
    const listTargetsCommand = new ListTargetsByRuleCommand({
      Rule: RULE_NAME,
    });
    const existingTargets = await eventBridgeClient.send(listTargetsCommand);
    
    const existingTarget = existingTargets.Targets?.find(
      (target) => target.Arn === WEBHOOK_URL || target.HttpParameters?.HeaderParameters?.endpoint === WEBHOOK_URL
    );

    if (existingTarget) {
      console.log(`   ⏭️  Target already exists`);
      return { success: true, exists: true };
    }

    // Remove old targets if any (to avoid conflicts)
    if (existingTargets.Targets && existingTargets.Targets.length > 0) {
      try {
        const removeTargetsCommand = new RemoveTargetsCommand({
          Rule: RULE_NAME,
          Ids: existingTargets.Targets.map((t) => t.Id),
        });
        await eventBridgeClient.send(removeTargetsCommand);
        console.log(`   Removed ${existingTargets.Targets.length} old target(s)`);
      } catch (removeError) {
        console.log(`   ⚠ Could not remove old targets: ${removeError.message}`);
      }
    }

    // Create HTTP endpoint target
    console.log(`   Creating HTTP endpoint target...`);
    const putTargetsCommand = new PutTargetsCommand({
      Rule: RULE_NAME,
      Targets: [
        {
          Id: "OrcaWebhookTarget",
          Arn: WEBHOOK_URL,
          HttpParameters: {
            HeaderParameters: {
              "Content-Type": "application/json",
            },
            PathParameterValues: [],
            QueryStringParameters: {},
          },
          RoleArn: EVENTBRIDGE_ROLE_ARN,
        },
      ],
    });

    await eventBridgeClient.send(putTargetsCommand);
    return { success: true, exists: false };
  } catch (error) {
    // EventBridge might not support direct HTTP targets in all regions
    // Try using API Destination instead
    if (error.message?.includes("HttpParameters") || error.message?.includes("not supported")) {
      console.log(`   ⚠ HTTP endpoint not directly supported, trying API Destination approach...`);
      // For now, return error - we'll need to set up API Destination separately
      return {
        success: false,
        error: "HTTP endpoint targets require API Destination setup. Consider using polling instead.",
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

async function setupRegion(region) {
  const results = {
    region,
    rule: null,
    target: null,
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

  // Create/Update EventBridge rule
  console.log(`\n📋 Creating/Updating EventBridge Rule: ${RULE_NAME}`);
  const ruleResult = await createOrUpdateEventBridgeRule(region);

  if (ruleResult.success) {
    if (ruleResult.exists) {
      console.log(`   ✅ Rule updated`);
    } else {
      console.log(`   ✅ Rule created`);
    }
    results.rule = { status: "success" };
  } else {
    console.log(`   ❌ Rule error: ${ruleResult.error}`);
    results.rule = { status: "error", error: ruleResult.error };
  }

  // Setup target
  console.log(`\n🎯 Setting up HTTP Endpoint Target`);
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  const targetResult = await setupEventBridgeTarget(region);

  if (targetResult.success) {
    if (targetResult.exists) {
      console.log(`   ✅ Target already configured`);
    } else {
      console.log(`   ✅ Target created`);
    }
    results.target = { status: "success" };
  } else {
    console.log(`   ❌ Target error: ${targetResult.error}`);
    results.target = { status: "error", error: targetResult.error };
  }

  return results;
}

async function setupAllEventBridgeRules() {
  console.log("🚀 Setting Up EventBridge Rules for Container Status Updates");
  console.log("=".repeat(70));
  console.log(`\nRule Name: ${RULE_NAME}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Regions: ${regions.length}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found");
    process.exit(1);
  }

  if (!AWS_ACCOUNT_ID) {
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
      process.exit(1);
    }
  }

  const allResults = [];

  for (const region of regions) {
    const result = await setupRegion(region);
    allResults.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  let rulesCreated = 0;
  let rulesUpdated = 0;
  let targetsCreated = 0;
  let targetsErrors = 0;

  allResults.forEach((result) => {
    if (result.rule?.status === "success") {
      // Check if it was new or updated by checking if error occurred
      rulesCreated++;
    }
    if (result.target?.status === "success") {
      targetsCreated++;
    } else if (result.target?.status === "error") {
      targetsErrors++;
    }
  });

  console.log(`\n✅ Rules: ${rulesCreated} created/updated`);
  console.log(`✅ Targets: ${targetsCreated} configured`);
  if (targetsErrors > 0) {
    console.log(`❌ Target Errors: ${targetsErrors}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n📝 IMPORTANT NOTES:");
  console.log("=".repeat(70));
  console.log("\nEventBridge HTTP endpoint targets may require API Destinations in some regions.");
  console.log("If targets fail, consider using server-side polling instead.");
  console.log("\n✅ EventBridge setup complete!\n");
}

setupAllEventBridgeRules().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

