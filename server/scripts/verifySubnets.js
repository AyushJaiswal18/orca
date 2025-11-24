import {
  EC2Client,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";
import { getRegionConfig } from "../src/constants.js";
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

function getEC2Client(region) {
  return new EC2Client({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function verifySubnetsInRegion(region) {
  const ec2Client = getEC2Client(region);
  const config = getRegionConfig(region);

  const results = {
    region,
    subnets: {
      allExist: true,
      missing: [],
      invalid: [],
    },
    securityGroup: {
      exists: false,
      valid: false,
    },
  };

  // Verify subnets
  for (const subnetId of config.subnets) {
    try {
      const command = new DescribeSubnetsCommand({
        SubnetIds: [subnetId],
      });
      const response = await ec2Client.send(command);
      if (response.Subnets && response.Subnets.length > 0) {
        const subnet = response.Subnets[0];
        if (subnet.AvailabilityZone.startsWith(region)) {
          // Subnet exists and is in correct region
        } else {
          results.subnets.invalid.push({
            id: subnetId,
            reason: `Subnet exists but in wrong region (${subnet.AvailabilityZone})`,
          });
          results.subnets.allExist = false;
        }
      }
    } catch (error) {
      if (error.name === "InvalidSubnetID.NotFound") {
        results.subnets.missing.push(subnetId);
        results.subnets.allExist = false;
      } else {
        results.subnets.invalid.push({
          id: subnetId,
          reason: error.message,
        });
        results.subnets.allExist = false;
      }
    }
  }

  // Verify security group
  if (config.securityGroups && config.securityGroups.length > 0) {
    try {
      const sgCommand = new DescribeSecurityGroupsCommand({
        GroupIds: [config.securityGroups[0]],
      });
      const sgResponse = await ec2Client.send(sgCommand);
      if (sgResponse.SecurityGroups && sgResponse.SecurityGroups.length > 0) {
        results.securityGroup.exists = true;
        results.securityGroup.valid = true;
      }
    } catch (error) {
      if (error.name === "InvalidGroup.NotFound") {
        results.securityGroup.exists = false;
      } else {
        results.securityGroup.valid = false;
        results.securityGroup.error = error.message;
      }
    }
  }

  return results;
}

async function verifyAllSubnets() {
  console.log("🔍 Verifying All Subnet Configurations");
  console.log("=".repeat(70));
  console.log("\nChecking if all subnet IDs and security groups exist in AWS...\n");

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found");
    process.exit(1);
  }

  const allResults = [];
  let allValid = true;

  for (const region of regions) {
    const result = await verifySubnetsInRegion(region);
    allResults.push(result);

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

    console.log(`📍 ${region} (${regionName})`);
    console.log("-".repeat(70));

    // Check subnets
    if (result.subnets.allExist && result.subnets.missing.length === 0) {
      console.log(`  ✅ All ${result.subnets.allExist ? getRegionConfig(region).subnets.length : 0} subnets exist`);
    } else {
      allValid = false;
      console.log(`  ❌ Subnet Issues:`);
      if (result.subnets.missing.length > 0) {
        console.log(`     Missing: ${result.subnets.missing.join(", ")}`);
      }
      if (result.subnets.invalid.length > 0) {
        result.subnets.invalid.forEach((inv) => {
          console.log(`     Invalid: ${inv.id} - ${inv.reason}`);
        });
      }
    }

    // Check security group
    if (result.securityGroup.exists && result.securityGroup.valid) {
      console.log(`  ✅ Security group exists`);
    } else {
      allValid = false;
      console.log(`  ❌ Security group: ${result.securityGroup.exists ? "Invalid" : "Not found"}`);
      if (result.securityGroup.error) {
        console.log(`     Error: ${result.securityGroup.error}`);
      }
    }

    console.log();
  }

  // Summary
  console.log("=".repeat(70));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(70));

  if (allValid) {
    console.log("\n✅ All subnet configurations are valid!");
    console.log("   All subnet IDs and security groups exist in their respective regions.\n");
  } else {
    console.log("\n❌ Some configurations have issues:");
    allResults.forEach((result) => {
      if (!result.subnets.allExist || !result.securityGroup.valid) {
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
        }[result.region];
        console.log(`\n  ${result.region} (${regionName}):`);
        if (!result.subnets.allExist) {
          console.log(`    - Subnet issues found`);
        }
        if (!result.securityGroup.valid) {
          console.log(`    - Security group issues found`);
        }
      }
    });
    console.log("\n⚠️  Please fix the issues above before deploying.\n");
  }

  console.log("=".repeat(70));
}

verifyAllSubnets().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

