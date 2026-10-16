import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';

dotenv.config();

// Public DNS servers for Node.js SRV resolution on Windows local machines if default resolver blocks it
if (process.platform === 'win32' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore if restricted
  }
}

const DEFAULT_MONGO_URI = "mongodb+srv://anshrarehman8_db_user:ProjectPass123@cluster0.igzcjcu.mongodb.net/ecommerce?appName=Cluster0";

export function getMongoUri() {
  let uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
  if (uri.includes("mongodb.net/?")) {
    uri = uri.replace("mongodb.net/?", "mongodb.net/ecommerce?");
  } else if (uri.endsWith("mongodb.net/")) {
    uri = uri + "ecommerce";
  }
  return uri;
}

let cachedConnection = null;
let cachedPromise = null;

export async function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = getMongoUri();
  if (!uri) {
    throw new Error("MongoDB URI is not configured");
  }

  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: true,
  }).then((mongooseInstance) => {
    cachedConnection = mongooseInstance.connection;
    return cachedConnection;
  }).catch((error) => {
    cachedPromise = null;
    console.warn("⚠️ MongoDB connection notice:", error.message);
    throw error;
  });

  return cachedPromise;
}

export default connectToMongo;
