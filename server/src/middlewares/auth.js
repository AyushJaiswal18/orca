import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const auth = asyncHandler(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token");
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token) {
    throw new ApiError(401, "Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id).select("-password");
    
    if (!req.user) {
      throw new ApiError(401, "Not authorized, user not found");
    }
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw new ApiError(401, "Not authorized, token failed");
    }
    throw error;
  }
});

// Flexible auth middleware that accepts token from header OR query parameter
// Useful for proxy routes that are accessed via browser links
export const authFlexible = asyncHandler(async (req, res, next) => {
  let token = null;

  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
    console.log("[AuthFlexible] Token found in Authorization header");
  }

  // If no token in header, try query parameter (for browser links)
  if (!token && req.query.token) {
    token = req.query.token;
    console.log("[AuthFlexible] Token found in query parameter");
  }

  // Debug logging
  if (!token) {
    console.error("[AuthFlexible] No token found:", {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20),
      queryParams: Object.keys(req.query),
      queryToken: req.query.token ? "exists" : "missing",
      url: req.url,
    });
    throw new ApiError(401, "Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id).select("-password");
    
    if (!req.user) {
      throw new ApiError(401, "Not authorized, user not found");
    }
    
    console.log(`[AuthFlexible] Authenticated user: ${req.user.email}`);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      console.error("[AuthFlexible] Token verification failed:", error.name);
      throw new ApiError(401, "Not authorized, token failed");
    }
    throw error;
  }
});

export default auth;
