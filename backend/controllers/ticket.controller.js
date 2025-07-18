import Ticket from "../models/ticket.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";


const createTicket = AsyncHandler(async (req, res) => {
  if (req.user.role !== "customer") {
    throw new ApiError(403, "Only customers can create tickets");
  }

  const { title, description, priority } = req.body;
  if (!title || !description || !priority) {
    throw new ApiError(400, "Missing required fields");
  }

  const ticket = await Ticket.create({
    title,
    description,
    priority,
    createdBy: req.user._id,
    customerId: req.user.customerId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});


const getMyTickets = AsyncHandler(async (req, res) => {
  const tickets = await Ticket.find({
    createdBy: req.user._id,
    customerId: req.user.customerId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "Fetched your tickets"));
});


const getAllTickets = AsyncHandler(async (req, res) => {
  if (!["admin", "agent"].includes(req.user.role)) {
    throw new ApiError(403, "Access denied");
  }

  const tickets = await Ticket.find({
    customerId: req.user.customerId,
  }).populate("createdBy assignedTo", "name email role");

  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "All tenant tickets fetched"));
});



const getTicketById = AsyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    customerId: req.user.customerId,
  }).populate("createdBy assignedTo", "name email role");

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket details fetched"));
});


const updateTicketStatus = AsyncHandler(async (req, res) => {
  if (!["admin", "agent"].includes(req.user.role)) {
    throw new ApiError(403, "Only agents or admins can update status");
  }

  const { status } = req.body;
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, customerId: req.user.customerId },
    { status },
    { new: true }
  );

  if (!ticket) throw new ApiError(404, "Ticket not found");

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket status updated"));
});


const assignTicket = AsyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can assign tickets");
  }

  const { agentId } = req.body;

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, customerId: req.user.customerId },
    { assignedTo: agentId, status: "in_progress" },
    { new: true }
  );

  if (!ticket) throw new ApiError(404, "Ticket not found");

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket assigned to agent"));
});


const deleteTicket = AsyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can delete tickets");
  }

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, customerId: req.user.customerId },
    { status: "deleted" },
    { new: true }
  );

  if (!ticket) throw new ApiError(404, "Ticket not found");

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket deleted (soft)"));
});

export {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
};
