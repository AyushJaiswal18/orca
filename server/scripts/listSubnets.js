import {
  EC2Client,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";
import dotenv from "dotenv";

dotenv.config();

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

function getEC2Client(region) {
  return new EC2Client({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function listSubnetsForRegion(region) {
  const ec2Client = getEC2Client(region);

  try {
    // Get all subnets
    const subnetsCommand = new DescribeSubnetsCommand({});
    const subnetsResponse = await ec2Client.send(subnetsCommand);

    // Filter for public subnets (ones with internet gateway route)
    // For Fargate, we need subnets that can assign public IPs
    const publicSubnets = subnetsResponse.Subnets.filter((subnet) => {
      // Check if subnet has MapPublicIpOnLaunch or is in a VPC with internet gateway
      return subnet.MapPublicIpOnLaunch === true || subnet.AvailableIpAddressCount > 0;
    });

    // Get default VPC subnets if available
    const defaultVPCSubnets = subnetsResponse.Subnets.filter(
      (subnet) => subnet.DefaultForAz === true
    );

    // Prefer default VPC subnets, otherwise use any public subnet
    const usableSubnets = defaultVPCSubnets.length > 0 ? defaultVPCSubnets : publicSubnets;

    // Get at least 2-3 subnets across different AZs
    const subnetsByAZ = {};
    usableSubnets.forEach((subnet) => {
      if (!subnetsByAZ[subnet.AvailabilityZone]) {
        subnetsByAZ[subnet.AvailabilityZone] = [];
      }
      subnetsByAZ[subnet.AvailabilityZone].push(subnet);
    });

    // Pick one subnet from each AZ (up to 3 AZs)
    const selectedSubnets = [];
    const azs = Object.keys(subnetsByAZ).slice(0, 3);
    azs.forEach((az) => {
      if (subnetsByAZ[az].length > 0) {
        selectedSubnets.push(subnetsByAZ[az][0]);
      }
    });

    // If we don't have enough, add more from available subnets
    if (selectedSubnets.length < 2) {
      const remaining = usableSubnets.filter(
        (s) => !selectedSubnets.find((ss) => ss.SubnetId === s.SubnetId)
      );
      selectedSubnets.push(...remaining.slice(0, 3 - selectedSubnets.length));
    }

    return {
      success: true,
      subnets: selectedSubnets.slice(0, 3).map((s) => ({
        id: s.SubnetId,
        az: s.AvailabilityZone,
        cidr: s.CidrBlock,
        availableIPs: s.AvailableIpAddressCount,
      })),
      allSubnets: subnetsResponse.Subnets.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function listSecurityGroupsForRegion(region) {
  const ec2Client = getEC2Client(region);

  try {
    const sgCommand = new DescribeSecurityGroupsCommand({});
    const sgResponse = await ec2Client.send(sgCommand);

    // Get default security group or first available
    const defaultSG = sgResponse.SecurityGroups.find((sg) => sg.GroupName === "default");
    const selectedSG = defaultSG || sgResponse.SecurityGroups[0];

    return {
      success: true,
      securityGroup: selectedSG
        ? {
            id: selectedSG.GroupId,
            name: selectedSG.GroupName,
            description: selectedSG.Description,
          }
        : null,
      allSecurityGroups: sgResponse.SecurityGroups.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function listAllResources() {
  console.log("🔍 Listing Subnets and Security Groups for All Regions");
  console.log("=".repeat(70));
  console.log("\nThis will help you configure the correct subnet IDs and security groups");
  console.log("for each region in your constants.js file.\n");

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Error: AWS credentials not found");
    console.error("Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
    process.exit(1);
  }

  const results = {};

  for (const region of regions) {
    console.log(`\n📍 Region: ${region}`);
    console.log("-".repeat(70));

    const subnetResult = await listSubnetsForRegion(region);
    const sgResult = await listSecurityGroupsForRegion(region);

    if (subnetResult.success && subnetResult.subnets.length > 0) {
      console.log(`\n✅ Subnets (${subnetResult.subnets.length} selected from ${subnetResult.allSubnets} total):`);
      subnetResult.subnets.forEach((subnet, index) => {
        console.log(`   ${index + 1}. ${subnet.id} (${subnet.az}) - ${subnet.cidr} (${subnet.availableIPs} IPs available)`);
      });
      results[region] = {
        subnets: subnetResult.subnets.map((s) => s.id),
      };
    } else {
      console.log(`\n❌ Error getting subnets: ${subnetResult.error || "No subnets found"}`);
      console.log("   You may need to create subnets in this region first.");
    }

    if (sgResult.success && sgResult.securityGroup) {
      console.log(`\n✅ Security Group:`);
      console.log(`   ${sgResult.securityGroup.id} (${sgResult.securityGroup.name})`);
      console.log(`   Description: ${sgResult.securityGroup.description}`);
      if (results[region]) {
        results[region].securityGroup = sgResult.securityGroup.id;
      }
    } else {
      console.log(`\n❌ Error getting security group: ${sgResult.error || "No security groups found"}`);
    }
  }

  // Generate configuration
  console.log("\n" + "=".repeat(70));
  console.log("\n📋 CONFIGURATION FOR constants.js");
  console.log("=".repeat(70));
  console.log("\nCopy this into your regionConfig object:\n");

  Object.keys(results).forEach((region) => {
    const config = results[region];
    if (config.subnets && config.subnets.length > 0) {
      const regionName = regions.find((r) => r === region);
      const comments = {
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
      };

      console.log(`  "${region}": {`);
      console.log(`    // ${comments[region] || region}`);
      console.log(`    subnets: [`);
      config.subnets.forEach((subnet) => {
        console.log(`      "${subnet}",`);
      });
      console.log(`    ],`);
      if (config.securityGroup) {
        console.log(`    securityGroups: ["${config.securityGroup}"],`);
      } else {
        console.log(`    securityGroups: ["sg-XXXXX"], // TODO: Add security group ID`);
      }
      console.log(`  },`);
    }
  });

  console.log("\n" + "=".repeat(70));
  console.log("\n✅ Listing complete!\n");
}

listAllResources().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

