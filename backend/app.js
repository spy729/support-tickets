import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.send(" Helpdesk Ticketing API is Live");
});


app.use((req, res, next) => {
  next(new ApiError(404, "Route Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(
    new ApiResponse(false, err.message || "Internal Server Error", null)
  );
});

export default app;
