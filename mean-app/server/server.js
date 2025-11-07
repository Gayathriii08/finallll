import express from "express";
import mongoose from "mongoose";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./src/api/modules/user/user.routes.js";
import opportunityRoutes from "./src/api/modules/opportunity/opportunity.routes.js";
import dashboardRoutes from "./src/api/modules/dashboard/dashboard.routes.js";
import adminPanelRoutes from "./src/api/modules/adminpanel/adminpanel.routes.js";
import messageRoutes from "./src/api/modules/messages/message.routes.js";

import errorHandler from "./src/api/middleware/errorHandler.js";
import pickupRoutes from "./src/api/modules/pickup/pickup.routes.js"; // <-- Pickup routes

dotenv.config();
const app = express();

// -------------------- MIDDLEWARES --------------------
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, try again later" }
});
app.use("/api/", limiter);

// -------------------- ROUTES --------------------
// User routes
app.use("/api/v1", authRoutes);

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});
const client = new MongoClient(process.env.DB_URI);
let db;
client.connect()
  .then(() => {
    db = client.db("atlas"); // use your DB name here
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Register opportunity routes

// Opportunity routes
app.use("/api/opportunities", opportunityRoutes);

// Pickup routes
app.use("/api/v1/pickup", pickupRoutes);  // <-- Added Schedule Pickup API

// Messages routes
app.use("/api/v1/messages", messageRoutes);

// Dashboard routes
app.use("/api/v1/dashboard", dashboardRoutes);

// -------------------- ERROR HANDLER --------------------
app.use(errorHandler);

// -------------------- DATABASE CONNECTION --------------------
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.use("/api/v1/admin", adminPanelRoutes);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*", // your frontend URL if needed
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
