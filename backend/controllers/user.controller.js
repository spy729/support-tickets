import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";


const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, role, customerId } = req.body;

  if (!name || !email || !password || !customerId) {
    throw new ApiError(400, "Missing required fields");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    customerId,
  });

  const token = generateToken(user);
  return res
    .status(201)
    .json(new ApiResponse(201, { token, user }, "User registered"));
});

const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or user inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user);
  return res
    .status(200)
    .json(new ApiResponse(200, { token, user }, "Login successful"));
});

const getAllUsers = AsyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can view all users");
  }

  const users = await User.find({ customerId: req.user.customerId });
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Fetched users successfully"));
});

export { registerUser, loginUser, getAllUsers };
