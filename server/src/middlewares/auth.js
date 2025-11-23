import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const auth = asyncHandler(async (req, res, next) => {
  let token = req.cookies.orca;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = await User.findById(decoded._id).select("-password");
      next();
    } catch (error) {
      throw new ApiError(401, "Not authorized, token failed");
    }
  } else {
    throw new ApiError(401, "Not authorized, no token");
  }
});

export default auth;
