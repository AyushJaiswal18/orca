import {
  EC2Client,
  AuthorizeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import dotenv from "dotenv";

dotenv.config();

// All regions
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

// Security groups from constants
const securityGroups = {
  "ap-south-1": ["sg-036cff92b5d899787"],
  "us-east-1": ["sg-01adfcbceebf97c06"],
  "us-east-2": ["sg-0555fe3c2969dd71e"],
  "us-west-1": ["sg-0a8e3dc1cf3c6f532"],
  "ap-northeast-2": ["sg-0ae6349b582857de2"],
  "ap-southeast-1": ["sg-08359c7afedfa0e00"],
  "ca-central-1": ["sg-0493536f76f25ce2b"],
  "eu-west-2": ["sg-0615c3107a13539ab"],
  "eu-west-3": ["sg-0e66e0a0ed1170c24"],
  "ap-northeast-3": ["sg-06ab5ce484a5c3c69"],
  "us-west-2": ["sg-0e9ba242cc84a64c3"],
};

function getEC2Client(region) {
  return new EC2Client({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function addSecurityGroupRule(region, sgId) {
  const ec2Client = getEC2Client(region);

  try {
    const command = new AuthorizeSecurityGroupIngressCommand({
      GroupId: sgId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 6901,
          ToPort: 6901,
          IpRanges: [
            {
              CidrIp: "0.0.0.0/0",
              Description: "Allow KasmWeb access on port 6901",
            },
          ],
        },
      ],
    });

    const response = await ec2Client.send(command);
    return { success: true, response };
  } catch (error) {
    if (error.name === "InvalidPermission.Duplicate") {
      return { success: true, message: "Rule already exists", skipped: true };
    }
    return { success: false, error: error.message, code: error.name };
  }
}

async function addRulesToAllRegions() {
  console.log("🔧 Adding Security Group Rules for Port 6901\n");
  console.log("=".repeat(80));
  console.log("\nThis will add an inbound rule allowing TCP port 6901 from 0.0.0.0/0");
  console.log("to all security groups in all regions.\n");

  const results = [];

  for (const region of regions) {
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

    console.log(`\n📍 ${region} (${regionName})`);
    console.log("-".repeat(80));

    const sgIds = securityGroups[region] || [];
    if (sgIds.length === 0) {
      console.log("❌ No security groups configured");
      results.push({ region, status: "no_sg" });
      continue;
    }

    for (const sgId of sgIds) {
      console.log(`\n  Security Group: ${sgId}`);
      const result = await addSecurityGroupRule(region, sgId);

      if (result.success) {
        if (result.skipped) {
          console.log(`  ✅ Rule already exists (skipped)`);
          results.push({ region, sgId, status: "exists" });
        } else {
          console.log(`  ✅ Rule added successfully`);
          results.push({ region, sgId, status: "added" });
        }
      } else {
        console.log(`  ❌ Error: ${result.error} (${result.code || "UNKNOWN"})`);
        results.push({ region, sgId, status: "error", error: result.error });
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(80));

  const added = results.filter((r) => r.status === "added").length;
  const exists = results.filter((r) => r.status === "exists").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`\n✅ Rules added: ${added}`);
  console.log(`ℹ️  Rules already existed: ${exists}`);
  console.log(`❌ Errors: ${errors}\n`);

  if (errors > 0) {
    console.log("Regions with errors:");
    results
      .filter((r) => r.status === "error")
      .forEach((r) => {
        console.log(`  - ${r.region} (${r.sgId}): ${r.error}`);
      });
    console.log();
  }

  if (added > 0 || exists > 0) {
    console.log("✅ Security group rules are now configured!");
    console.log("   Containers in all regions should now be accessible.\n");
  }
}

addRulesToAllRegions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

