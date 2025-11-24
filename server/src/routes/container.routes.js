import { Router } from "express";
import {
  containerUpdates,
  createContainer,
  getContainers,
  redirectToTask,
  stopContainer,
  proxyContainer,
} from "../controllers/container.controller.js";
import auth, { authFlexible } from "../middlewares/auth.js";

const router = Router();

router.route("/startNew").post(auth, createContainer);

router.route("/getContainers").get(auth, getContainers);

router.route("/redirectToTask/:taskArn").get(redirectToTask);

router.route("/stopContainer/:taskArn").get(auth, stopContainer);

router.route("/updates").post(containerUpdates);

// Proxy route - handles both HTTP and WebSocket
// Uses authFlexible to accept token from header OR query parameter
router.route("/proxy/:taskArn").all(authFlexible, proxyContainer);

export default router;
