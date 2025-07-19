import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
  filterTickets,
  getTicketsByUser,
} from "../controllers/ticket.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes
router.use(authMiddleware);

router.post("/", createTicket);
router.get("/me", getMyTickets);

router.get("/filter/params", filterTickets);
router.get("/user/:userId", getTicketsByUser);

router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.put("/:id/status", updateTicketStatus);
router.put("/:id/assign", assignTicket);
router.delete("/:id", deleteTicket);

export default router;
