import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addService, getServices } from "../controllers/services.controller.js";

const router = Router();

router.route("/getServices").get(auth, getServices);

router.route("/addService").post(addService);

export default router;
