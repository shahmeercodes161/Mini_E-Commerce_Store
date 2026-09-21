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

// Routes middleware
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

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
async function connectToMongo() {
  if (mongoose.connection.readyState === 1 || isConnecting) return;
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

// Auto-reconnect loop every 10 seconds if disconnected (detects IP whitelist changes automatically)
setInterval(() => {
  if (mongoose.connection.readyState !== 1) {
    connectToMongo();
  }
}, 10000);

// Start your server
const server = app.listen(PORT, () => {
  console.log(`Doorstep Backend Server is running on port ${PORT}`);
});

// Keep process active even if external cloud DB handshake is pending
setInterval(() => {}, 1000 * 60 * 60);