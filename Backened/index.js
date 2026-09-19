import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

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

// Routes middleware
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Connect to MongoDB using the URI from your .env file
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch((error) => {
    console.warn("⚠️ MongoDB Atlas connection notice:", error.message);
    console.warn("💡 Tip: If you see SSL/whitelist errors, ensure your current IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.");
  });

// Start your server
app.listen(PORT, () => {
  console.log(`Doorstep Backend Server is running on port ${PORT}`);
});