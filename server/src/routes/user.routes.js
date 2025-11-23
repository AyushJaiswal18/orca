import { Router } from "express";
import {
  cookieChecker,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logoutUser);

router.route("/cookieChecker").get(auth, cookieChecker);

// router.route("/profile").get();

// router.route("/updateProfile").get();

// router.route("/deleteProfile").get();

export default router;
