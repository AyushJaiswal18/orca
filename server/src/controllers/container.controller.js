import { Containers } from "../models/containers.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Services } from "../models/services.modal.js";
import { runTask, getTaskPublicIp, stopTask } from "../utils/awsTask.js";
import pkg from "http-proxy";
import axios from "axios";
const { createProxy } = pkg;

export const createContainer = asyncHandler(async (req, res) => {
  const { instanceName, selectedService, region } = req.body;
  if (
    [instanceName, selectedService, region].some(
      (field) => field?.trim() === ""
    )
  ) {
    ``;
    throw new ApiError(400, "All Fields are Required!");
  }
  const service = await Services.findById(selectedService);
  if (!service) {
    throw new ApiError(404, "Service not found");
  }
  if (service.cost > req.user.credits) {
    throw new ApiError(400, "Insufficient Credits!");
  }
  const runTaskResult = await runTask(service.name, region); //Selected Service in given region
  if (runTaskResult.failures && runTaskResult.failures.length > 0) {
    throw new ApiError(
      500,
      `Failed to run task: ${runTaskResult.failures[0].reason}`
    );
  }
  const taskArn = runTaskResult.tasks[0].taskArn.split("/").pop();
  req.user.credits -= service.cost;
  await req.user.save();
  const container = new Containers({
    user: req.user._id,
    name: instanceName,
    service: selectedService,
    taskArn: taskArn,
    region: region,
  });
  await container.save();
  return res
    .status(201)
    .json(new ApiResponse(201, container, "New Container created"));
});

export const redirectToTask = asyncHandler(async (req, res) => {
  const { taskArn } = req.params;
  const container = await Containers.findOne({ taskArn });
  if (!container) {
    throw new ApiError(404, "Container not found");
  }
  const publicIp = await getTaskPublicIp(taskArn, container.region);
  const proxy = createProxy();
  if (publicIp) {
    return res.status(200).redirect(publicIp);
  }
  throw new ApiError(500, "Not able to get Public IP of Task!");
});

export const getContainers = asyncHandler(async (req, res) => {
  const containers = await Containers.find({ user: req.user._id }).populate(
    "service"
  );
  return res.status(200).json(new ApiResponse(200, containers));
});

export const containerUpdates = asyncHandler(async (req, res) => {
  // Log incoming request for debugging
  console.log("SNS Webhook received - Content-Type:", req.headers["content-type"]);
  console.log("SNS Webhook - Body type:", typeof req.body);
  console.log("SNS Webhook - Body keys:", req.body ? Object.keys(req.body) : "undefined");

  const body = req.body;

  // Handle case where body might be undefined or empty
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
    console.error("SNS Webhook - Empty or undefined body received");
    console.log("Request headers:", req.headers);
    return res.status(200).send("OK"); // Return OK to prevent retries
  }

  // Handle SubscriptionConfirmation
  if (body.Type === "SubscriptionConfirmation") {
    console.log("SNS Subscription Confirmation received");
    console.log("SubscribeURL:", body.SubscribeURL);
    
    if (body.SubscribeURL) {
      try {
        const response = await axios.get(body.SubscribeURL);
        console.log("Subscription confirmed successfully");
        return res.status(200).send("OK");
      } catch (error) {
        console.error("Error confirming subscription:", error.message);
        // Still return OK to prevent SNS retries
        return res.status(200).send("OK");
      }
    }
    return res.status(200).send("OK");
  }

  // Handle Notification (task status updates)
  if (body.Type === "Notification" && body.Message) {
    try {
      // Parse the Message field (it's a JSON string)
      const message = typeof body.Message === "string" 
        ? JSON.parse(body.Message) 
        : body.Message;

      // Handle ECS task state change events
      if (message.detail && message.detail.taskArn) {
        const lastStatus = message.detail.lastStatus;
        const taskArn = message.detail.taskArn.split("/").pop();
        const desiredStatus = message.detail.desiredStatus;
        
        console.log(
          `Task Update: ${taskArn} | LastStatus: ${lastStatus} | DesiredStatus: ${desiredStatus}`
        );

        const task = await Containers.findOne({ taskArn: taskArn });
        
        if (task) {
          if (lastStatus === "RUNNING" && desiredStatus === "RUNNING") {
            // Task is running, get public IP
            const publicIp = await getTaskPublicIp(taskArn, task.region);
            if (publicIp) {
              task.url = publicIp;
              task.status = "RUNNING";
              await task.save();
              console.log(`Task ${taskArn} is RUNNING at ${publicIp}`);
            } else {
              console.log(`Could not get public IP for task ${taskArn}, deleting container`);
              await Containers.findByIdAndDelete(task._id);
            }
          } else if (lastStatus === "STOPPED") {
            // Task stopped, delete container record
            console.log(`Task ${taskArn} is STOPPED, deleting container`);
            try {
              await Containers.findByIdAndDelete(task._id);
            } catch (error) {
              console.error("Error deleting stopped container:", error);
            }
          } else {
            // Update status for other states (PROVISIONING, PENDING, etc.)
            task.status = lastStatus;
            await task.save();
            console.log(`Task ${taskArn} status updated to ${lastStatus}`);
          }
        } else {
          console.log(`No container found for task ${taskArn}`);
        }
      } else {
        console.log("SNS Notification received but no task detail found in message");
      }
    } catch (error) {
      console.error("Error processing SNS notification:", error);
      console.error("Message content:", body.Message);
    }
  } else {
    console.log("SNS webhook received with unknown format:", body.Type);
  }

  // Always return 200 OK to acknowledge receipt
  return res.status(200).send("OK");
});

export const stopContainer = asyncHandler(async (req, res) => {
  const { taskArn } = req.params;
  const task = await Containers.findOne({ taskArn });
  if (!task) {
    throw new ApiError(404, "Container not found");
  }
  const result = stopTask(task.taskArn, task.region);
  if (result) {
    await Containers.findByIdAndDelete(task._id);
    return res.status(200).json(new ApiResponse(200, {}, "Container Stopped"));
  }
});
