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
  // SNS sends data as form-encoded, so req.body should be parsed by urlencoded middleware
  const body = req.body;
  
  // Debug logging
  console.log("SNS Webhook received");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Body type:", typeof body);
  console.log("Body keys:", body ? Object.keys(body) : "undefined");
  
  // Handle case where body might be undefined
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
    console.error("SNS Webhook - Empty or undefined body");
    return res.status(200).send("OK");
  }

  // Handle SubscriptionConfirmation
  if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
    console.log("SNS Subscription Confirmation received");
    try {
      await axios.get(body.SubscribeURL);
      console.log("Subscription confirmed successfully");
    } catch (error) {
      console.error("Error confirming subscription:", error.message);
    }
    return res.status(200).send("OK");
  }

  // Handle Notification (task status updates)
  if (body.Type === "Notification" && body.Message) {
    try {
      // Message is a JSON string, parse it
      const message = typeof body.Message === "string" 
        ? JSON.parse(body.Message) 
        : body.Message;

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
            const publicIp = await getTaskPublicIp(taskArn, task.region);
            if (publicIp) {
              task.url = publicIp;
              task.status = "RUNNING";
              await task.save();
            } else {
              await Containers.findByIdAndDelete(task._id);
            }
          } else if (lastStatus === "STOPPED") {
            try {
              await Containers.findByIdAndDelete(task._id);
            } catch (error) {
              console.error(error);
            }
          } else {
            task.status = lastStatus;
            await task.save();
          }
        }
      }
    } catch (error) {
      console.error("Error processing SNS notification:", error);
      console.error("Message content:", body.Message);
    }
  }

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
