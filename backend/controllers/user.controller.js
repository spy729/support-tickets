
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  AsyncHandler  from "../utils/AsyncHandler.js";
import { generateJWT } from "../utils/jwt.js"; // Adjust path based on your structure

// Register
const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, role, customerId } = req.body;
  if (!name || !email || !password || !customerId) {
    throw new ApiError(400, "Missing required fields");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    customerId,
  });

  const token = generateToken(user);
  res.status(201).json(new ApiResponse(201, { token, user }, "User registered"));
});

// Login
const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) throw new ApiError(401, "Invalid email or user inactive");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const token = generateToken(user);
  res.status(200).json(new ApiResponse(200, { token, user }, "Login successful"));
});

// Get all users (admin only)
const getAllUsers = AsyncHandler(async (req, res) => {
  const users = await User.find({ customerId: req.user.customerId });
  res.status(200).json(new ApiResponse(200, users, "Fetched users successfully"));
});

// Get user by ID
const getUserById = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// Update user
const updateUser = AsyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;

  await user.save();
  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// Deactivate user
const deactivateUser = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = false;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, "User deactivated"));
});

// Change user role
const changeUserRole = AsyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.role = role;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, "User role updated"));
});

// Get users by role
const getUsersByRole = AsyncHandler(async (req, res) => {
  const { role } = req.params;
  const users = await User.find({ role, customerId: req.user.customerId });

  res.status(200).json(new ApiResponse(200, users, `Users with role ${role} fetched`));
});

export {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  changeUserRole,
  getUsersByRole,
};
