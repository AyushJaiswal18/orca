import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (
    [first_name, last_name, email, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are Required!");
  }
  const existedUser = await User.findOne({ $or: [{ email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists!");
  }
  const user = await User.create({ first_name, last_name, email, password });
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Not able to register!");
  }
  const token = await createdUser.generateAccessToken();
  return res
    .status(201)
    .json(new ApiResponse(200, { user: createdUser, token }, "User registered Successfully!"));
});

export const verifyAuth = asyncHandler(async (req, res) => {
  // Verify token and return current user
  // req.user is set by auth middleware after validating bearer token
  res.status(200).json(new ApiResponse(200, req.user, "User is authenticated!"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are Required!");
  }
  const existedUser = await User.findOne({ email: email });
  if (!existedUser) {
    throw new ApiError(409, "User does not exists!");
  }
  const result = await existedUser.isPasswordValid(password);
  if (!result) {
    throw new ApiError(400, "Invalid Password!");
  }
  const token = await existedUser.generateAccessToken();
  const user = existedUser.toObject();
  delete user.password;
  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "Logged in Successfully!"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  // With bearer token auth, logout is handled client-side by removing the token
  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.userid;
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new ApiError(400, `User with id ${id} is not found!`);
  }
  return res.status(200).json(new ApiResponse(200, user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { first_name, last_name, email } = req.body;
  const userId = req.user._id;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(409, "Email is already taken!");
    }
  }

  const updateData = {};
  if (first_name) updateData.first_name = first_name.trim();
  if (last_name) updateData.last_name = last_name.trim();
  if (email) updateData.email = email.trim();

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully!"));
});

export const buyCredits = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid credit amount!");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { credits: amount } },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  return res.status(200).json(new ApiResponse(200, user, `Successfully added ${amount} credits!`));
});

export const upgradeToPro = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isProMember: true } },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  return res.status(200).json(new ApiResponse(200, user, "Successfully upgraded to Pro!"));
});
