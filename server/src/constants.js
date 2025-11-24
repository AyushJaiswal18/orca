const config = {
  db_name: "orcadb2",
};

export const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

export const jsonOptions = {
  limit: "16kb",
};

export const urlEncodedOptions = {
  extended: true,
  limit: "16kb",
};

// AWS Region Configuration
// Each region requires its own subnet IDs and security group ID
// Update these values based on your AWS infrastructure setup
export const regionConfig = {
  "ap-south-1": {
    // Mumbai
    subnets: [
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: ["sg-036cff92b5d899787"],
  },
  "us-east-1": {
    // N Virginia
    subnets: [
      "subnet-037beaed73d9adcec",
      "subnet-07f0330e294e687ac",
      "subnet-0eb6ebf31fec761b0",
    ],
    securityGroups: ["sg-01adfcbceebf97c06"],
  },
  "us-east-2": {
    // Ohio
    subnets: [
      "subnet-0fc4092cb024cfe7c",
      "subnet-0f96f24d9c71f7b53",
      "subnet-057d387fda9c4fa9f",
    ],
    securityGroups: ["sg-0555fe3c2969dd71e"],
  },
  "us-west-1": {
    // N California
    subnets: [
      "subnet-06aab4b1b46027eed",
      "subnet-014ddaacff1b678e1",
    ],
    securityGroups: ["sg-0a8e3dc1cf3c6f532"],
  },
  "ap-northeast-2": {
    // Seoul
    subnets: [
      "subnet-086cfe2d71df4310f",
      "subnet-0576678935c112ddd",
      "subnet-00c9bdcedf9e25e40",
    ],
    securityGroups: ["sg-0ae6349b582857de2"],
  },
  "ap-southeast-1": {
    // Singapore
    subnets: [
      "subnet-00e0f042be3ce5e1c",
      "subnet-0ea7f381856c5a6f8",
      "subnet-0f35c7a867b5d4f43",
    ],
    securityGroups: ["sg-08359c7afedfa0e00"],
  },
  "ca-central-1": {
    // Canada
    subnets: [
      "subnet-0ad7ce49ad2143e93",
      "subnet-04729aa217f80ef7a",
      "subnet-05cbc61181a0d4ff9",
    ],
    securityGroups: ["sg-0493536f76f25ce2b"],
  },
  "eu-west-2": {
    // London
    subnets: [
      "subnet-091a20174d8ab86c4",
      "subnet-0c5f5756db0cc57d5",
      "subnet-0b1b9fd7f39308c4d",
    ],
    securityGroups: ["sg-0615c3107a13539ab"],
  },
  "eu-west-3": {
    // Paris
    subnets: [
      "subnet-003d4871cc67319fc",
      "subnet-00a0095946633f776",
      "subnet-0190e4cd26d442e4c",
    ],
    securityGroups: ["sg-0e66e0a0ed1170c24"],
  },
  "ap-northeast-3": {
    // Osaka
    subnets: [
      "subnet-0f33a10e52a590bd7",
      "subnet-0f927da833e0f8b9d",
      "subnet-06e2c5361cc78e830",
    ],
    securityGroups: ["sg-06ab5ce484a5c3c69"],
  },
  "us-west-2": {
    // Oregon
    subnets: [
      "subnet-0b15cfc8ca4e81565",
      "subnet-0c4038151598b8266",
      "subnet-04278cbd7ec91b658",
    ],
    securityGroups: ["sg-0e9ba242cc84a64c3"],
  },
};

// Default region configuration (fallback to ap-south-1 if region not found)
export const getRegionConfig = (region) => {
  return (
    regionConfig[region] || {
      subnets: regionConfig["ap-south-1"].subnets,
      securityGroups: regionConfig["ap-south-1"].securityGroups,
    }
  );
};

export default config;
