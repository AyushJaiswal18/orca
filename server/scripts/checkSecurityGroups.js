import {
  EC2Client,
  DescribeSecurityGroupsCommand,
  DescribeSecurityGroupRulesCommand,
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

async function checkSecurityGroup(region, sgId) {
  const ec2Client = getEC2Client(region);

  try {
    const command = new DescribeSecurityGroupsCommand({
      GroupIds: [sgId],
    });
    const response = await ec2Client.send(command);

    if (response.SecurityGroups && response.SecurityGroups.length > 0) {
      const sg = response.SecurityGroups[0];
      const inboundRules = sg.IpPermissions || [];

      // Check for port 6901
      const port6901Rules = inboundRules.filter(
        (rule) => rule.FromPort === 6901 || rule.ToPort === 6901 || (rule.FromPort <= 6901 && rule.ToPort >= 6901)
      );

      return {
        exists: true,
        name: sg.GroupName,
        description: sg.Description,
        port6901Rules: port6901Rules.map((rule) => ({
          protocol: rule.IpProtocol,
          fromPort: rule.FromPort,
          toPort: rule.ToPort,
          ipRanges: rule.IpRanges?.map((range) => ({
            cidr: range.CidrIp,
            description: range.Description,
          })) || [],
          ipv6Ranges: rule.Ipv6Ranges || [],
        })),
        allInboundRules: inboundRules.length,
      };
    } else {
      return { exists: false };
    }
  } catch (error) {
    if (error.name === "InvalidGroup.NotFound") {
      return { exists: false, error: "Security group not found" };
    }
    return { exists: false, error: error.message };
  }
}

async function checkAllRegions() {
  console.log("🔍 Checking Security Groups for Port 6901 Access\n");
  console.log("=".repeat(80));

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
      const result = await checkSecurityGroup(region, sgId);

      if (!result.exists) {
        console.log(`  ❌ Security group not found or error: ${result.error || "Unknown"}`);
        results.push({ region, sgId, status: "not_found", error: result.error });
        continue;
      }

      console.log(`  ✅ Found: ${result.name || "N/A"}`);
      if (result.description) {
        console.log(`  Description: ${result.description}`);
      }

      if (result.port6901Rules.length === 0) {
        console.log(`  ⚠️  No rules for port 6901 found!`);
        console.log(`  📝 Total inbound rules: ${result.allInboundRules}`);
        results.push({ region, sgId, status: "no_port_6901", name: result.name });
      } else {
        console.log(`  ✅ Found ${result.port6901Rules.length} rule(s) for port 6901:`);
        result.port6901Rules.forEach((rule, idx) => {
          console.log(`    Rule ${idx + 1}:`);
          console.log(`      Protocol: ${rule.protocol}`);
          console.log(`      Port: ${rule.fromPort}${rule.toPort !== rule.fromPort ? `-${rule.toPort}` : ""}`);
          if (rule.ipRanges.length > 0) {
            console.log(`      IP Ranges:`);
            rule.ipRanges.forEach((range) => {
              console.log(`        - ${range.cidr}${range.description ? ` (${range.description})` : ""}`);
            });
          } else {
            console.log(`      ⚠️  No IP ranges configured!`);
          }
        });
        results.push({ region, sgId, status: "ok", name: result.name, rules: result.port6901Rules });
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 SUMMARY\n");
  console.log("=".repeat(80));

  const ok = results.filter((r) => r.status === "ok").length;
  const noPort = results.filter((r) => r.status === "no_port_6901").length;
  const notFound = results.filter((r) => r.status === "not_found").length;

  console.log(`\n✅ Regions with port 6901 access: ${ok}`);
  console.log(`⚠️  Regions missing port 6901 rules: ${noPort}`);
  console.log(`❌ Regions with security group errors: ${notFound}\n`);

  if (noPort > 0) {
    console.log("⚠️  Regions that need port 6901 rules:");
    results
      .filter((r) => r.status === "no_port_6901")
      .forEach((r) => {
        console.log(`  - ${r.region} (${r.sgId})`);
      });
    console.log("\n💡 To fix, add an inbound rule to each security group:");
    console.log("   Type: Custom TCP");
    console.log("   Port: 6901");
    console.log("   Source: 0.0.0.0/0 (or your server's IP for better security)");
    console.log("   Description: Allow KasmWeb access\n");
  }
}

checkAllRegions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

