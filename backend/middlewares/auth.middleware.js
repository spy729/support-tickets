import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const authMiddleware = AsyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized: Invalid or inactive user");
  }

  req.user = {
    id: user._id,
    role: user.role,
    customerId: user.customerId, // this enables tenant-aware filtering
    email: user.email,
  };

  next();
});

export default authMiddleware;
