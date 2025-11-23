import {
  ECSClient,
  RunTaskCommand,
  DescribeTasksCommand,
  StopTaskCommand,
} from "@aws-sdk/client-ecs";
import {
  EC2Client,
  DescribeNetworkInterfacesCommand,
} from "@aws-sdk/client-ec2";
import { getRegionConfig } from "../constants.js";

const cluster = "MachineXCluster";

function getECSClient(region) {
  return new ECSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function getParams(taskDefinition, region) {
  const regionNetworkConfig = getRegionConfig(region);
  const params = {
    cluster: cluster,
    taskDefinition: taskDefinition,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: regionNetworkConfig.subnets,
        securityGroups: regionNetworkConfig.securityGroups,
        assignPublicIp: "ENABLED",
      },
    },
  };
  return params;
}

export async function runTask(imageToRun, region) {
  const ecsClient = getECSClient(region);
  imageToRun = imageToRun.replace(" ", "-");
  const params = getParams(imageToRun, region);
  const command = new RunTaskCommand(params);
  const runTaskResult = await ecsClient.send(command);
  return runTaskResult;
}

export async function getTaskPublicIp(taskArn, region) {
  try {
    const ecsClient = getECSClient(region);
    const describeTasksParams = {
      cluster: cluster,
      tasks: [taskArn],
    };
    const describeTasksCommand = new DescribeTasksCommand(describeTasksParams);
    const describeTasksResponse = await ecsClient.send(describeTasksCommand);
    let task = describeTasksResponse.tasks[0];

    if (task.lastStatus === "RUNNING") {
      const eniId = task.attachments[0].details.find(
        (detail) => detail.name === "networkInterfaceId"
      ).value;
      const ec2Client = new EC2Client({ region: region });
      const describeNetworkInterfacesParams = {
        NetworkInterfaceIds: [eniId],
      };
      const describeNetworkInterfacesCommand =
        new DescribeNetworkInterfacesCommand(describeNetworkInterfacesParams);
      const describeNetworkInterfacesResponse = await ec2Client.send(
        describeNetworkInterfacesCommand
      );
      const networkInterface =
        describeNetworkInterfacesResponse.NetworkInterfaces[0];
      const publicIp = networkInterface.Association.PublicIp;
      return `https://${publicIp}:6901`;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function stopTask(taskArn, region) {
  const ecsClient = getECSClient(region);
  const command = new StopTaskCommand({
    cluster: cluster,
    task: taskArn,
  });

  try {
    const data = await ecsClient.send(command);
    return true;
  } catch (err) {
    return false;
  }
}
