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
const EXECUTION_ROLE_NAME = "ecsTaskExecutionRole";
const TASK_ROLE_NAME = "ecsTaskRole";

// Trust policy for ECS to assume the role
const ECS_TRUST_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        Service: "ecs-tasks.amazonaws.com",
      },
      Action: "sts:AssumeRole",
    },
  ],
};

// Execution role policy (for pulling images and CloudWatch logs)
const EXECUTION_ROLE_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ],
      Resource: "*",
    },
  ],
};

// Task role policy (minimal - can be extended based on your needs)
const TASK_ROLE_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
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

async function createOrUpdateRole(roleName, trustPolicy, policies) {
  const iamClient = getIAMClient();
  const roleArn = `arn:aws:iam::${AWS_ACCOUNT_ID}:role/${roleName}`;

  try {
    // Check if role exists
    const getRoleCommand = new GetRoleCommand({ RoleName: roleName });
    try {
      const existingRole = await iamClient.send(getRoleCommand);
      console.log(`   ✓ Role ${roleName} already exists`);

      // Update trust policy to ensure it's correct
      try {
        const updateTrustCommand = new UpdateAssumeRolePolicyCommand({
          RoleName: roleName,
          PolicyDocument: JSON.stringify(trustPolicy),
        });
        await iamClient.send(updateTrustCommand);
        console.log(`   ✅ Updated trust policy for ${roleName}`);
      } catch (updateError) {
        console.log(`   ⚠ Could not update trust policy: ${updateError.message}`);
      }
      return { success: true, arn: existingRole.Role.Arn, exists: true };
    } catch (error) {
      if (error.name === "NoSuchEntity" || error.message?.includes("cannot be found")) {
        // Role doesn't exist, create it
        console.log(`   Creating role ${roleName}...`);
        try {
          const createRoleCommand = new CreateRoleCommand({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
            Description: `ECS ${roleName} for Orca platform`,
          });

          const role = await iamClient.send(createRoleCommand);
          console.log(`   ✅ Created role: ${role.Role.Arn}`);

          // Attach inline policy
          if (policies && policies.length > 0) {
            for (const policy of policies) {
              try {
                const putPolicyCommand = new PutRolePolicyCommand({
                  RoleName: roleName,
                  PolicyName: policy.name,
                  PolicyDocument: JSON.stringify(policy.document),
                });
                await iamClient.send(putPolicyCommand);
                console.log(`   ✅ Attached policy: ${policy.name}`);
              } catch (policyError) {
                console.log(`   ⚠ Could not attach policy ${policy.name}: ${policyError.message}`);
              }
            }
          }

          return { success: true, arn: role.Role.Arn, exists: false };
        } catch (createError) {
          console.error(`   ❌ Error creating role ${roleName}:`, createError.message);
          return { success: false, error: createError.message };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error(`   ❌ Error with role ${roleName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function fixIAMRoles() {
  console.log("🔧 Fixing IAM Roles for ECS Tasks");
  console.log("=".repeat(70));
  console.log(`\nAccount ID: ${AWS_ACCOUNT_ID}`);
  console.log(`Execution Role: ${EXECUTION_ROLE_NAME}`);
  console.log(`Task Role: ${TASK_ROLE_NAME}\n`);

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

  console.log("\n1️⃣  Creating/Verifying Execution Role:");
  console.log("-".repeat(70));
  const executionRoleResult = await createOrUpdateRole(
    EXECUTION_ROLE_NAME,
    ECS_TRUST_POLICY,
    [{ name: "ECSTaskExecutionPolicy", document: EXECUTION_ROLE_POLICY }]
  );

  console.log("\n2️⃣  Creating/Verifying Task Role:");
  console.log("-".repeat(70));
  const taskRoleResult = await createOrUpdateRole(
    TASK_ROLE_NAME,
    ECS_TRUST_POLICY,
    [{ name: "ECSTaskPolicy", document: TASK_ROLE_POLICY }]
  );

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  if (executionRoleResult.success) {
    console.log(`\n✅ Execution Role: ${executionRoleResult.arn}`);
    if (!executionRoleResult.exists) {
      console.log("   (Newly created)");
    }
  } else {
    console.log(`\n❌ Execution Role: ${executionRoleResult.error}`);
  }

  if (taskRoleResult.success) {
    console.log(`\n✅ Task Role: ${taskRoleResult.arn}`);
    if (!taskRoleResult.exists) {
      console.log("   (Newly created)");
    }
  } else {
    console.log(`\n❌ Task Role: ${taskRoleResult.error}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n📝 IMPORTANT:");
  console.log("=".repeat(70));
  console.log("\nIf roles were just created, you may need to:");
  console.log("1. Wait a few seconds for IAM changes to propagate");
  console.log("2. Verify the trust relationship allows 'ecs-tasks.amazonaws.com'");
  console.log("3. Ensure your IAM user has 'iam:PassRole' permission for these roles");
  console.log("\nTo grant PassRole permission, add this to your IAM user policy:");
  console.log(`
{
  "Effect": "Allow",
  "Action": [
    "iam:PassRole"
  ],
  "Resource": [
    "arn:aws:iam::${AWS_ACCOUNT_ID}:role/${EXECUTION_ROLE_NAME}",
    "arn:aws:iam::${AWS_ACCOUNT_ID}:role/${TASK_ROLE_NAME}"
  ]
}
  `);
  console.log("\n✅ IAM Roles setup complete!\n");
}

fixIAMRoles().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

