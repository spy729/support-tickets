import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getScreensForTenant } from "../controllers/screen.controller.js";

const router = express.Router();

router.get("/me/screens", authMiddleware, getScreensForTenant);

export default router;
