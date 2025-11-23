import { Services } from "../models/services.modal.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getServices = asyncHandler(async (req, res) => {
  const services = await Services.find();
  if (!services) {
    throw new ApiError(404, "No services found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, services, "All available services"));
});

export const addService = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const service = new Services({
    name,
    description,
  });
  await service.save();
  return res
    .status(201)
    .json(new ApiResponse(201, service, "Service added successfully"));
});
