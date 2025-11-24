import { Router } from "express";
import {
  containerUpdates,
  createContainer,
  getContainers,
  redirectToTask,
  stopContainer,
  proxyContainer,
} from "../controllers/container.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.route("/startNew").post(auth, createContainer);

router.route("/getContainers").get(auth, getContainers);

router.route("/redirectToTask/:taskArn").get(redirectToTask);

router.route("/stopContainer/:taskArn").get(auth, stopContainer);

router.route("/updates").post(containerUpdates);

// Proxy route - handles both HTTP and WebSocket
router.route("/proxy/:taskArn").all(auth, proxyContainer);

export default router;
