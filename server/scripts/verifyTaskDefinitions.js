import {
  ECSClient,
  ListTaskDefinitionsCommand,
  DescribeTaskDefinitionCommand,
} from "@aws-sdk/client-ecs";
import dotenv from "dotenv";

dotenv.config();

const regions = [
  "ap-south-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "ap-northeast-2",
  "ap-southeast-1",
  "ca-central-1",
  "eu-west-2",
  "eu-west-3",
  "ap-northeast-3",
  "us-west-2",
];

const taskDefinitionFamilies = ["Chrome-Browser", "Vivaldi-Browser"];
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID || "381492078318";
const EXPECTED_EXECUTION_ROLE = `arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole`;
const EXPECTED_TASK_ROLE = `arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskRole`;

function getECSClient(region) {
  return new ECSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function checkTaskDefinition(region, family) {
  const ecsClient = getECSClient(region);

  try {
    // List task definitions for this family
    const listCommand = new ListTaskDefinitionsCommand({
      familyPrefix: family,
      sort: "DESC",
      maxResults: 1,
    });
    const listResponse = await ecsClient.send(listCommand);

    if (!listResponse.taskDefinitionArns || listResponse.taskDefinitionArns.length === 0) {
      return {
        exists: false,
        error: "Task definition not found",
      };
    }

    // Get the latest task definition
    const taskDefArn = listResponse.taskDefinitionArns[0];
    const describeCommand = new DescribeTaskDefinitionCommand({
      taskDefinition: taskDefArn,
    });
    const taskDef = await ecsClient.send(describeCommand);

    const executionRole = taskDef.taskDefinition?.executionRoleArn;
    const taskRole = taskDef.taskDefinition?.taskRoleArn;

    const issues = [];
    if (executionRole !== EXPECTED_EXECUTION_ROLE) {
      issues.push(`Execution role mismatch: ${executionRole} (expected: ${EXPECTED_EXECUTION_ROLE})`);
    }
    if (taskRole !== EXPECTED_TASK_ROLE) {
      issues.push(`Task role mismatch: ${taskRole || "none"} (expected: ${EXPECTED_TASK_ROLE})`);
    }

    return {
      exists: true,
      arn: taskDefArn,
      revision: taskDef.taskDefinition?.revision,
      executionRole,
      taskRole,
      issues,
      correct: issues.length === 0,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

async function verifyAllTaskDefinitions() {
  console.log("🔍 Verifying Task Definitions");
  console.log("=".repeat(70));
  console.log(`\nExpected Execution Role: ${EXPECTED_EXECUTION_ROLE}`);
  console.log(`Expected Task Role: ${EXPECTED_TASK_ROLE}\n`);

  const results = [];

  for (const region of regions) {
    console.log(`\n📍 Region: ${region}`);
    console.log("-".repeat(70));

    for (const family of taskDefinitionFamilies) {
      const result = await checkTaskDefinition(region, family);
      results.push({ region, family, ...result });

      if (!result.exists) {
        console.log(`  ❌ ${family}: ${result.error}`);
      } else if (result.correct) {
        console.log(`  ✅ ${family} (revision ${result.revision}): Roles correct`);
      } else {
        console.log(`  ⚠️  ${family} (revision ${result.revision}):`);
        result.issues.forEach((issue) => {
          console.log(`     - ${issue}`);
        });
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const incorrect = results.filter((r) => r.exists && !r.correct).length;
  const missing = results.filter((r) => !r.exists).length;

  console.log(`\n✅ Correct: ${correct}`);
  console.log(`⚠️  Incorrect: ${incorrect}`);
  console.log(`❌ Missing: ${missing}\n`);

  if (incorrect > 0) {
    console.log("⚠️  Task definitions with incorrect roles need to be updated.");
    console.log("   You may need to register new revisions with correct role ARNs.\n");
  }

  return results;
}

verifyAllTaskDefinitions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

