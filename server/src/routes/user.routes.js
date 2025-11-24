import { Router } from "express";
import {
  verifyAuth,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
  buyCredits,
  upgradeToPro,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(auth, logoutUser);

router.route("/verify").get(auth, verifyAuth);

router.route("/updateProfile").put(auth, updateProfile);

router.route("/buyCredits").post(auth, buyCredits);

router.route("/upgradeToPro").post(auth, upgradeToPro);

export default router;
