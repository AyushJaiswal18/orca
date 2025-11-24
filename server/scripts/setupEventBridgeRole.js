import {
  IAMClient,
  GetRoleCommand,
  CreateRoleCommand,
  PutRolePolicyCommand,
  UpdateAssumeRolePolicyCommand,
} from "@aws-sdk/client-iam";
import dotenv from "dotenv";

dotenv.config();

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const ROLE_NAME = "EventBridgeHttpInvocationRole";

// Trust policy for EventBridge to assume the role
const EVENTBRIDGE_TRUST_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        Service: "events.amazonaws.com",
      },
      Action: "sts:AssumeRole",
    },
  ],
};

// Policy for EventBridge to invoke HTTP endpoints
const EVENTBRIDGE_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: [
        "events:InvokeApiDestination",
        "events:InvokeHttpEndpoint",
      ],
      Resource: "*",
    },
  ],
};

function getIAMClient() {
  return new IAMClient({
    region: "us-east-1", // IAM is global but SDK requires a region
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function createOrUpdateRole() {
  const iamClient = getIAMClient();

  try {
    // Check if role exists
    const getRoleCommand = new GetRoleCommand({ RoleName: ROLE_NAME });
    try {
      const existingRole = await iamClient.send(getRoleCommand);
      console.log(`   ✓ Role ${ROLE_NAME} already exists`);

      // Update trust policy
      try {
        const updateTrustCommand = new UpdateAssumeRolePolicyCommand({
          RoleName: ROLE_NAME,
          PolicyDocument: JSON.stringify(EVENTBRIDGE_TRUST_POLICY),
        });
        await iamClient.send(updateTrustCommand);
        console.log(`   ✅ Updated trust policy for ${ROLE_NAME}`);
      } catch (updateError) {
        console.log(`   ⚠ Could not update trust policy: ${updateError.message}`);
      }

      return { success: true, arn: existingRole.Role.Arn, exists: true };
    } catch (error) {
      if (error.name === "NoSuchEntity" || error.message?.includes("cannot be found")) {
        // Role doesn't exist, create it
        console.log(`   Creating role ${ROLE_NAME}...`);
        try {
          const createRoleCommand = new CreateRoleCommand({
            RoleName: ROLE_NAME,
            AssumeRolePolicyDocument: JSON.stringify(EVENTBRIDGE_TRUST_POLICY),
            Description: `EventBridge role for HTTP endpoint invocation`,
          });

          const role = await iamClient.send(createRoleCommand);
          console.log(`   ✅ Created role: ${role.Role.Arn}`);

          // Attach inline policy
          try {
            const putPolicyCommand = new PutRolePolicyCommand({
              RoleName: ROLE_NAME,
              PolicyName: "EventBridgeHttpInvocationPolicy",
              PolicyDocument: JSON.stringify(EVENTBRIDGE_POLICY),
            });
            await iamClient.send(putPolicyCommand);
            console.log(`   ✅ Attached policy: EventBridgeHttpInvocationPolicy`);
          } catch (policyError) {
            console.log(`   ⚠ Could not attach policy: ${policyError.message}`);
          }

          return { success: true, arn: role.Role.Arn, exists: false };
        } catch (createError) {
          console.error(`   ❌ Error creating role ${ROLE_NAME}:`, createError.message);
          return { success: false, error: createError.message };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error(`   ❌ Error with role ${ROLE_NAME}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function setupEventBridgeRole() {
  console.log("🔧 Setting Up EventBridge IAM Role");
  console.log("=".repeat(70));
  console.log(`\nRole Name: ${ROLE_NAME}`);
  console.log(`Account ID: ${AWS_ACCOUNT_ID || "Will auto-detect"}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found");
    console.error("Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
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
      console.error("Please set AWS_ACCOUNT_ID in .env");
      process.exit(1);
    }
  }

  console.log("Creating/Verifying EventBridge Role:");
  console.log("-".repeat(70));
  const result = await createOrUpdateRole();

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  if (result.success) {
    console.log(`\n✅ Role: ${result.arn}`);
    if (!result.exists) {
      console.log("   (Newly created)");
    }
    console.log("\n✅ EventBridge role setup complete!\n");
  } else {
    console.log(`\n❌ Role creation failed: ${result.error}\n`);
    process.exit(1);
  }
}

setupEventBridgeRole().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

