import { Router } from "express";
import {
  containerUpdates,
  createContainer,
  getContainers,
  getContainer,
  redirectToTask,
  stopContainer,
} from "../controllers/container.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.route("/startNew").post(auth, createContainer);

router.route("/getContainers").get(auth, getContainers);

router.route("/getContainer/:id").get(auth, getContainer);

router.route("/redirectToTask/:taskArn").get(redirectToTask);

router.route("/stopContainer/:taskArn").get(auth, stopContainer);

router.route("/updates").post(containerUpdates);

export default router;
