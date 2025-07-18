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

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.use(authMiddleware);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deactivateUser);

// Admin only
router.patch("/:id/role", changeUserRole);
router.get("/role/:role", getUsersByRole);

export default router;
