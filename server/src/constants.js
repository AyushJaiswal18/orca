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
      // TODO: Replace with your actual subnet IDs for us-east-1
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for us-east-1
      "sg-036cff92b5d899787",
    ],
  },
  "us-east-2": {
    // Ohio
    subnets: [
      // TODO: Replace with your actual subnet IDs for us-east-2
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for us-east-2
      "sg-036cff92b5d899787",
    ],
  },
  "us-west-1": {
    // N California
    subnets: [
      // TODO: Replace with your actual subnet IDs for us-west-1
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for us-west-1
      "sg-036cff92b5d899787",
    ],
  },
  "ap-northeast-2": {
    // Seoul
    subnets: [
      // TODO: Replace with your actual subnet IDs for ap-northeast-2
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for ap-northeast-2
      "sg-036cff92b5d899787",
    ],
  },
  "ap-southeast-1": {
    // Singapore
    subnets: [
      // TODO: Replace with your actual subnet IDs for ap-southeast-1
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for ap-southeast-1
      "sg-036cff92b5d899787",
    ],
  },
  "ca-central-1": {
    // Canada
    subnets: [
      // TODO: Replace with your actual subnet IDs for ca-central-1
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for ca-central-1
      "sg-036cff92b5d899787",
    ],
  },
  "eu-west-2": {
    // London
    subnets: [
      // TODO: Replace with your actual subnet IDs for eu-west-2
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for eu-west-2
      "sg-036cff92b5d899787",
    ],
  },
  "eu-west-3": {
    // Paris
    subnets: [
      // TODO: Replace with your actual subnet IDs for eu-west-3
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for eu-west-3
      "sg-036cff92b5d899787",
    ],
  },
  "ap-northeast-3": {
    // Osaka
    subnets: [
      // TODO: Replace with your actual subnet IDs for ap-northeast-3
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for ap-northeast-3
      "sg-036cff92b5d899787",
    ],
  },
  "us-west-2": {
    // Oregon
    subnets: [
      // TODO: Replace with your actual subnet IDs for us-west-2
      "subnet-01ae542552fbc01fa",
      "subnet-048071594ee5ceaca",
      "subnet-0233f75ef70da093c",
    ],
    securityGroups: [
      // TODO: Replace with your actual security group ID for us-west-2
      "sg-036cff92b5d899787",
    ],
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
