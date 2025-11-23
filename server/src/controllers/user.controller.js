import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import setTokenAsCookie from "../utils/setTokenAsCookie.js";

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
  setTokenAsCookie(res, token);
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully!"));
});

export const cookieChecker = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "User is Logged in!"));
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
  setTokenAsCookie(res, token);
  const user = existedUser.toObject();
  delete user.password;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Logged in Successfully!"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("orca", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.userid;
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new ApiError(400, `User with id ${id} is not found!`);
  }
  return res.status(200).json(new ApiResponse(200, user));
});
