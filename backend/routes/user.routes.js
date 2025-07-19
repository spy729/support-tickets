import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  changeUserRole,
  getUsersByRole,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes - require auth
router.use(authMiddleware);

// Admin only routes
router.get("/", authorizeRoles("admin"), getAllUsers);
router.get("/role/:role", authorizeRoles("admin"), getUsersByRole);
router.put("/:id", authorizeRoles("admin"), updateUser);
router.put("/:id/deactivate", authorizeRoles("admin"), deactivateUser);
router.put("/:id/role", authorizeRoles("admin"), changeUserRole);

// Both admin and self can access
router.get("/:id", getUserById);

export default router;
