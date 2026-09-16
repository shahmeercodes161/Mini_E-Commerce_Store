import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
// Load environment variables from your .env file
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware to read JSON bodies sent from frontend
app.use(express.json());

// Routes middleware
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Connect to MongoDB using the URI from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start your server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});