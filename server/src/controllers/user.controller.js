import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendOtpMail} from "../utils/sendMail.js";
import { logger } from "../utils/logger.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  logger.info("User registration attempt", { module: "user", email, name: `${firstName} ${lastName}` });
  if (
    [email, password, firstName, lastName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required!");
  }
  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    if (existedUser.isEmailVerified) {
      throw new ApiError(409, "User already exists!");
    } else {
      await User.deleteOne({ _id: existedUser._id });
    }
  }
  try {
    const user = new User({ email, password, firstName, lastName });
    await user.save();
    logger.info("User registered successfully", { module: "user", userId: user._id, email: user.email, name: `${user.firstName} ${user.lastName}` });
    const token = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    const otp = await user.generateOtp();
    const mailRes = await sendOtpMail(email, firstName, otp);
    if (!mailRes) {
      logger.error("Failed to send OTP email during registration", { module: "user", email, name: `${firstName} ${lastName}` });
      throw new ApiError(
        500,
        "Failed to send OTP email. Please try again later."
      );
    }
    const data = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isEmailVerified: user.isVerified,
        avatar: user.avatar,
      },
      token,
      refreshToken,
    };
    return res
      .status(201)
      .json(new ApiResponse(201, data, "User Registered Successfully!"));
  } catch (error) {
    logger.error("User registration failed", { module: "user", email, name: `${firstName} ${lastName}`, error: error.message });
    throw new ApiError(500, "Failed to register user", error);
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.info("User login attempt", { module: "user", email });
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are Required!");
  }
  const existedUser = await User.findOne({ email: email });
  if (!existedUser) {
    logger.warn("Login failed: user does not exist", { module: "user", email });
    throw new ApiError(409, "User does not exists!");
  }
  if (!existedUser.isEmailVerified) {
    logger.warn("Login failed: email not verified", { module: "user", email, userId: existedUser._id, name: `${existedUser.firstName} ${existedUser.lastName}` });
    throw new ApiError(403, "Email is not verified. Please register again.");
  }
  const result = await existedUser.isPasswordValid(password);
  if (!result) {
    logger.warn("Login failed: invalid password", { module: "user", email, userId: existedUser._id, name: `${existedUser.firstName} ${existedUser.lastName}` });
    throw new ApiError(400, "Invalid Password!");
  }
  const token = await existedUser.generateAccessToken();
  const refreshToken = await existedUser.generateRefreshToken();
  const user = {
    id: existedUser._id,
    email: existedUser.email,
    firstName: existedUser.firstName,
    lastName: existedUser.lastName,
    phone: existedUser.phone,
    avatar: existedUser.avatar,
    isEmailVerified: existedUser.isVerified,
    createdAt: existedUser.createdAt,
    updatedAt: existedUser.updatedAt,
  };
  const data = { user, token, refreshToken };
  await Activity.create({
    userId: existedUser._id,
    type: "login",
    doneByAdmin: false,
  });
  logger.info("User logged in successfully", { module: "user", userId: existedUser._id, email: existedUser.email, name: `${existedUser.firstName} ${existedUser.lastName}` });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Logged in Successfully!"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully!"));
});

