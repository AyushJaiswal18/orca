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
  let body

  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).send('Invalid JSON');
    }
  } else {
    body = req.body;
  }

  if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
    try {
      
      await axios.get(body.SubscribeURL);
    } catch (error) {
      console.error("Error confirming subscription:", error);
    }
  } else {
    const message = JSON.parse(body.Message);
    const lastStatus = message.detail.lastStatus;
    const taskArn = message.detail.taskArn.split("/").pop();
    const desiredStatus = message.detail.desiredStatus;
    console.log(
      `Task : ${taskArn} LastStatus: ${lastStatus} DesiredStatus: ${desiredStatus}`
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
