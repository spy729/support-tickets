import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";

import dotenv from "dotenv";
dotenv.config();

describe("Tenant Data Isolation", () => {
  let server;
  let tenantAUser, tenantBUser;
  let tenantAUserToken, tenantBUserToken;

  beforeAll(async () => {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test-db";
    await mongoose.connect(MONGO_URI);
    server = app.listen(4000);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create users for Tenant A and Tenant B
    tenantAUser = await User.create({
      name: "Tenant A User",
      email: "tenantA@example.com",
      password: "password123",
      customerId: "TenantA",
      isActive: true,
    });

    tenantBUser = await User.create({
      name: "Tenant B User",
      email: "tenantB@example.com",
      password: "password123",
      customerId: "TenantB",
      isActive: true,
    });

    // Generate tokens
    tenantAUserToken = jwt.sign({ id: tenantAUser._id }, process.env.JWT_SECRET);
    tenantBUserToken = jwt.sign({ id: tenantBUser._id }, process.env.JWT_SECRET);

    // Create tickets for each tenant
    await Ticket.create([
      {
        title: "Tenant A ticket",
        description: "Issue A",
        createdBy: tenantAUser._id,
        customerId: "TenantA",
      },
      {
        title: "Tenant B ticket",
        description: "Issue B",
        createdBy: tenantBUser._id,
        customerId: "TenantB",
      },
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
  });

  test("should not allow Tenant A to see Tenant B's tickets", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${tenantAUserToken}`);

    expect(res.statusCode).toBe(200);
    const ticketTitles = res.body.map((ticket) => ticket.title);

    expect(ticketTitles).toContain("Tenant A ticket");
    expect(ticketTitles).not.toContain("Tenant B ticket");
  });
});
