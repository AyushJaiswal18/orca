import {
  ECSClient,
  DescribeTasksCommand,
  ListTasksCommand,
} from "@aws-sdk/client-ecs";
import { Containers } from "../models/containers.model.js";
import { getTaskPublicIp } from "./awsTask.js";

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

async function checkTaskStatus(container) {
  try {
    const ecsClient = getECSClient(container.region);
    
    // container.taskArn is already just the task ID (last part of ARN)
    // ECS DescribeTasks accepts either full ARN or just the task ID
    const taskId = container.taskArn;
    
    const describeCommand = new DescribeTasksCommand({
      cluster: cluster,
      tasks: [taskId],
    });

    const response = await ecsClient.send(describeCommand);
    
    if (!response.tasks || response.tasks.length === 0) {
      // Task doesn't exist, delete container
      console.log(`Task ${container.taskArn} not found, deleting container`);
      await Containers.findByIdAndDelete(container._id);
      return;
    }

    const task = response.tasks[0];
    const lastStatus = task.lastStatus;
    const desiredStatus = task.desiredStatus;

    // Update container status if it changed
    if (container.status !== lastStatus) {
      if (lastStatus === "RUNNING" && desiredStatus === "RUNNING") {
        // Task is running, get public IP
        const publicIp = await getTaskPublicIp(container.taskArn, container.region);
        if (publicIp) {
          container.url = publicIp;
          container.status = "RUNNING";
          await container.save();
          console.log(`✅ Container ${container.name} (${container.taskArn}) is RUNNING at ${publicIp}`);
        } else {
          console.log(`⚠️ Could not get public IP for task ${container.taskArn}`);
          // Don't delete immediately, might be still provisioning
        }
      } else if (lastStatus === "STOPPED") {
        // Task stopped, delete container record
        console.log(`🗑️ Container ${container.name} (${container.taskArn}) is STOPPED, deleting`);
        await Containers.findByIdAndDelete(container._id);
      } else {
        // Update status for other states (PROVISIONING, PENDING, etc.)
        container.status = lastStatus;
        await container.save();
        console.log(`📝 Container ${container.name} (${container.taskArn}) status: ${lastStatus}`);
      }
    }
  } catch (error) {
    if (error.name === "InvalidParameterException" || error.message?.includes("not found")) {
      // Task doesn't exist, delete container
      console.log(`Task ${container.taskArn} not found, deleting container`);
      await Containers.findByIdAndDelete(container._id);
    } else {
      console.error(`Error checking task ${container.taskArn}:`, error.message);
    }
  }
}

export async function pollAllContainerStatuses() {
  try {
    // Get all containers that are not stopped
    const containers = await Containers.find({
      status: { $ne: "STOPPED" },
    });

    console.log(`\n🔄 Polling ${containers.length} container(s)...`);

    // Check status for each container
    for (const container of containers) {
      await checkTaskStatus(container);
    }

    return { checked: containers.length };
  } catch (error) {
    console.error("Error polling container statuses:", error);
    return { error: error.message };
  }
}

