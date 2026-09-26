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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from your .env file
dotenv.config();

// Set public DNS servers for Node.js SRV resolution on Windows if default resolver blocks it
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if dns.setServers is restricted
}

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware to read JSON bodies sent from frontend
app.use(express.json());

// Serve uploaded product images statically from local uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB using the URI from your .env file
let mongoUri = process.env.MONGO_URI || "";
// Ensure targeted database is 'ecommerce' if default root path
if (mongoUri.includes("mongodb.net/?")) {
  mongoUri = mongoUri.replace("mongodb.net/?", "mongodb.net/ecommerce?");
} else if (mongoUri.endsWith("mongodb.net/")) {
  mongoUri = mongoUri + "ecommerce";
}

mongoose.set('bufferCommands', false);

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

let isConnecting = false;
export async function connectToMongo() {
  if (mongoose.connection.readyState === 1 || isConnecting || !mongoUri) return;
  isConnecting = true;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    console.warn("⚠️ MongoDB Atlas connection notice:", error.message);
    console.warn("💡 Tip: If you see SSL/whitelist errors, ensure your current IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.");
  } finally {
    isConnecting = false;
  }
}

// Initial connection attempt
connectToMongo();

// Serverless middleware: ensure MongoDB is connected for database-dependent routes
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && mongoUri) {
    try {
      await connectToMongo();
    } catch {}
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