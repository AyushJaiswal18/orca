import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    if (req.originalUrl.startsWith("/api/v1/jobs?")) {
      return next();
    }
    throw new ApiError(401, "Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      if (req.originalUrl.startsWith("/api/v1/jobs?")) {
        return next();
      }
      throw new ApiError(404, "Invalid token, user not found");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (req.originalUrl.startsWith("/api/v1/jobs?")) {
      return next();
    }
    throw new ApiError(401, "Not authorized, invalid or expired token", error);
  }
});
