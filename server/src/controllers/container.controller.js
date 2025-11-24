import { Containers } from "../models/containers.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Services } from "../models/services.modal.js";
import { runTask, getTaskPublicIp, stopTask } from "../utils/awsTask.js";
import httpProxy from "http-proxy";
import axios from "axios";

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
  // EventBridge sends events directly as JSON (no SNS envelope)
  const body = req.body;

  // Handle both EventBridge format and legacy SNS format for backward compatibility
  let eventDetail = null;
  let lastStatus = null;
  let taskArn = null;
  let desiredStatus = null;

  // Check if this is EventBridge format (direct event)
  if (body.detail && body["detail-type"] === "ECS Task State Change") {
    // EventBridge format
    eventDetail = body.detail;
    lastStatus = eventDetail.lastStatus;
    taskArn = eventDetail.taskArn?.split("/").pop();
    desiredStatus = eventDetail.desiredStatus;
    console.log(`EventBridge: Task ${taskArn} | LastStatus: ${lastStatus} | DesiredStatus: ${desiredStatus}`);
  }
  // Check if this is SNS format (legacy support)
  else if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
    try {
      await axios.get(body.SubscribeURL);
      console.log("SNS subscription confirmed");
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Error confirming SNS subscription:", error);
      return res.status(200).send("OK");
    }
  } else if (body.Type === "Notification" && body.Message) {
    // SNS notification format
    try {
      const message = typeof body.Message === "string" ? JSON.parse(body.Message) : body.Message;
      if (message.detail) {
        eventDetail = message.detail;
        lastStatus = eventDetail.lastStatus;
        taskArn = eventDetail.taskArn?.split("/").pop();
        desiredStatus = eventDetail.desiredStatus;
        console.log(`SNS: Task ${taskArn} | LastStatus: ${lastStatus} | DesiredStatus: ${desiredStatus}`);
      }
    } catch (error) {
      console.error("Error parsing SNS message:", error);
      return res.status(200).send("OK");
    }
  }

  // Process the event if we have valid data
  if (taskArn && lastStatus) {
    const task = await Containers.findOne({ taskArn: taskArn });
    if (task) {
      if (lastStatus === "RUNNING" && desiredStatus === "RUNNING") {
        // Task is running, get public IP
        const publicIp = await getTaskPublicIp(taskArn, task.region);
        if (publicIp) {
          task.url = publicIp;
          task.status = "RUNNING";
          await task.save();
          console.log(`✅ Task ${taskArn} is RUNNING at ${publicIp}`);
        } else {
          console.log(`⚠️ Could not get public IP for task ${taskArn}`);
          await Containers.findByIdAndDelete(task._id);
        }
      } else if (lastStatus === "STOPPED") {
        // Task stopped, delete container record
        console.log(`🗑️ Task ${taskArn} is STOPPED, deleting container`);
        try {
          await Containers.findByIdAndDelete(task._id);
        } catch (error) {
          console.error("Error deleting stopped container:", error);
        }
      } else {
        // Update status for other states (PROVISIONING, PENDING, etc.)
        task.status = lastStatus;
        await task.save();
        console.log(`📝 Task ${taskArn} status updated to ${lastStatus}`);
      }
    } else {
      console.log(`⚠️ No container found for task ${taskArn}`);
    }
  } else {
    console.log("⚠️ Invalid event format - missing taskArn or lastStatus");
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

// Extract IP from URL (handles both https://ip:6901 and http://ip:6901 formats)
function extractIpFromUrl(url) {
  if (!url) return null;
  // Remove protocol and extract IP
  const match = url.match(/(?:https?:\/\/)?([\d.]+)/);
  return match ? match[1] : null;
}

// Get target URL for a container
async function getContainerTargetUrl(taskArn, userId) {
  // Find container and verify user has access
  const container = await Containers.findOne({ taskArn, user: userId });
  if (!container) {
    throw new ApiError(404, "Container not found or access denied");
  }

  // Get target IP - use stored URL or fetch fresh
  let targetIp = null;
  if (container.url) {
    targetIp = extractIpFromUrl(container.url);
  }

  // If no IP from stored URL, fetch it
  if (!targetIp) {
    const publicIpUrl = await getTaskPublicIp(taskArn, container.region);
    if (publicIpUrl) {
      targetIp = extractIpFromUrl(publicIpUrl);
    }
  }

  if (!targetIp) {
    throw new ApiError(500, "Unable to get container IP address");
  }

  // Target URL for KasmWeb (uses HTTP, not HTTPS)
  return `http://${targetIp}:6901`;
}

// Proxy container access through server (HTTP)
export const proxyContainer = asyncHandler(async (req, res) => {
  const { taskArn } = req.params;

  // Get target URL
  let targetUrl;
  try {
    targetUrl = await getContainerTargetUrl(taskArn, req.user._id);
    console.log(`[Proxy] Proxying to: ${targetUrl} for taskArn: ${taskArn}`);
  } catch (error) {
    console.error(`[Proxy] Error getting target URL for ${taskArn}:`, error.message);
    throw error;
  }

  // Create proxy instance with timeout
  const proxy = httpProxy.createProxyServer({
    target: targetUrl,
    ws: true, // Enable WebSocket proxying
    changeOrigin: true,
    secure: false, // KasmWeb uses HTTP, not HTTPS
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000,
  });

  // Handle proxy errors with detailed logging
  proxy.on("error", (err, req, res) => {
    console.error(`[Proxy] Error proxying to ${targetUrl}:`, {
      message: err.message,
      code: err.code,
      taskArn,
    });
    
    if (!res.headersSent) {
      // Provide more specific error messages
      let errorMessage = "Unable to connect to container";
      if (err.code === "ECONNREFUSED") {
        errorMessage = "Container is not accepting connections. It may be starting up or the security group may be blocking access.";
      } else if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
        errorMessage = "Connection to container timed out. The container may be unreachable.";
      } else if (err.code === "ENOTFOUND") {
        errorMessage = "Container IP address not found.";
      }
      
      res.status(502).json({
        success: false,
        message: errorMessage,
        error: err.code || "PROXY_ERROR",
      });
    }
  });

  // Set request timeout
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message: "Request timeout: Container did not respond in time",
      });
    }
  });

  // Handle regular HTTP requests
  proxy.web(req, res, {
    target: targetUrl,
  });
});

// Proxy WebSocket connections (called from server upgrade handler)
export const proxyContainerWebSocket = async (req, socket, head, userId) => {
  try {
    const { taskArn } = req.params || {};
    
    if (!taskArn) {
      console.error("[Proxy WS] No taskArn provided");
      socket.destroy();
      return;
    }

    // Get target URL
    let targetUrl;
    try {
      targetUrl = await getContainerTargetUrl(taskArn, userId);
      const wsTargetUrl = targetUrl.replace("http://", "ws://");
      console.log(`[Proxy WS] Proxying WebSocket to: ${wsTargetUrl} for taskArn: ${taskArn}`);

      // Create proxy for WebSocket with timeout
      const proxy = httpProxy.createProxyServer({
        target: wsTargetUrl,
        ws: true,
        changeOrigin: true,
        secure: false,
        timeout: 30000,
      });

      proxy.on("error", (err) => {
        console.error(`[Proxy WS] Error proxying WebSocket to ${wsTargetUrl}:`, {
          message: err.message,
          code: err.code,
          taskArn,
        });
        socket.destroy();
      });

      // Proxy the WebSocket connection
      proxy.ws(req, socket, head);
    } catch (error) {
      console.error(`[Proxy WS] Error getting target URL for ${taskArn}:`, error.message);
      socket.destroy();
    }
  } catch (error) {
    console.error("[Proxy WS] Error in WebSocket proxy:", error);
    socket.destroy();
  }
};
