import { Router } from "express";
import {
  containerUpdates,
  createContainer,
  getContainers,
  redirectToTask,
  stopContainer,
} from "../controllers/container.controller.js";
import auth from "../middlewares/auth.js";
import { snsWebhookParser } from "../middlewares/snsWebhook.js";

const router = Router();

router.route("/startNew").post(auth, createContainer);

router.route("/getContainers").get(auth, getContainers);

router.route("/redirectToTask/:taskArn").get(redirectToTask);

router.route("/stopContainer/:taskArn").get(auth,stopContainer);

router.route("/updates").post(snsWebhookParser, containerUpdates);

export default router;
