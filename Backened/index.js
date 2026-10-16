import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { seedInitialData } from "./seedProducts.js";
import { syncPendingUsers } from "./controllers/authController.js";

import { connectToMongo, getMongoUri } from "./db/connect.js";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from your .env file
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware to read JSON bodies sent from frontend
app.use(express.json());

// Uploads directory configuration (safely handles Vercel /tmp or local uploads)
const uploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadsDir));

// Re-export connectToMongo for serverless entry points
export { connectToMongo };

mongoose.connection.on('error', (err) => {
  console.warn("MongoDB connection event notice:", err.message);
});

mongoose.connection.on('connected', async () => {
  console.log("✅ Successfully connected to MongoDB Atlas!");
  await seedInitialData();
  await syncPendingUsers();
});

process.on('unhandledRejection', (reason) => {
  console.warn("Handled rejection:", reason?.message || reason);
});

// Initial connection attempt
connectToMongo().catch(() => {});

// Serverless middleware: ensure MongoDB is connected for database-dependent routes
app.use(async (req, res, next) => {
  // Normalize rewritten path from Vercel if needed
  if (req.url === '/api/index.js' || req.url === '/index.js' || req.url === '/api' || req.url === '/api/' || req.url === '/api/index') {
    const matched = req.headers['x-matched-path'];
    if (matched && matched !== req.url) {
      req.url = matched;
    }
  }

  // Health check can proceed without waiting for database
  if (req.url === '/api/health' || req.url === '/health') {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    try {
      await connectToMongo();
    } catch (err) {
      console.warn("Database connection notice in middleware:", err.message);
    }
  }
  next();
});

// Routes middleware (mounted both with and without /api prefix for maximum hosting compatibility)
app.use("/api/products", productRoutes);
app.use("/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/payment", paymentRoutes);

// Health check route
app.get(["/api/health", "/health", "/api", "/"], (req, res) => {
  res.json({
    status: "ok",
    message: "Doorstep API Backend is operational",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    environment: process.env.VERCEL ? "vercel-serverless" : "standalone-node"
  });
});

// Standalone mode: Only listen on port when not running as a Vercel serverless function
if (!process.env.VERCEL) {
  // Auto-reconnect loop every 10 seconds if disconnected
  setInterval(() => {
    if (mongoose.connection.readyState !== 1) {
      connectToMongo();
    }
  }, 10000);

  // Start your local server
  app.listen(PORT, () => {
    console.log(`Doorstep Backend Server is running on port ${PORT}`);
  });
}

export default app;