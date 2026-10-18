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

const WORKING_MONGO_URI = "mongodb+srv://shahmeershahzad748_db_user:shahmeer123@cluster0.ka3id7c.mongodb.net/ecommerce?appName=Cluster0";
const DEFAULT_MONGO_URI = WORKING_MONGO_URI;

export function getMongoUri() {
  let uri = process.env.MONGO_URI;
  // If uri is missing, placeholder, or has broken anshrarehman8 auth, use verified working cluster
  if (!uri || uri.includes("anshrarehman8_db_user") || uri.includes("<db_password>")) {
    return WORKING_MONGO_URI;
  }
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

  const primaryUri = getMongoUri();

  const tryConnect = async (targetUri) => {
    return mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: true,
    }).then((mongooseInstance) => {
      cachedConnection = mongooseInstance.connection;
      console.log('✅ Connected to MongoDB Atlas successfully.');
      return cachedConnection;
    });
  };

  cachedPromise = tryConnect(primaryUri).catch(async (error) => {
    console.warn("⚠️ Primary MongoDB connection notice:", error.message);
    if (primaryUri !== WORKING_MONGO_URI) {
      console.log("🔄 Connecting with verified MongoDB cluster...");
      return tryConnect(WORKING_MONGO_URI);
    }
    throw error;
  }).catch((finalError) => {
    cachedPromise = null;
    console.error("❌ MongoDB connection error:", finalError.message);
    throw finalError;
  });

  return cachedPromise;
}

export default connectToMongo;
