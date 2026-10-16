import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectToMongo } from '../db/connect.js';

let pendingUsers = [];

// Helper: Sync any legacy pending users if any existed
export const syncPendingUsers = async () => {
  if (mongoose.connection.readyState !== 1 || pendingUsers.length === 0) return;
  try {
    for (const u of pendingUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      }
    }
    console.log(`✅ Synced ${pendingUsers.length} user(s) into MongoDB!`);
    pendingUsers = [];
  } catch (err) {
    console.warn('Notice syncing pending users:', err.message);
  }
};

// 1. User Registration (Guaranteed storage in MongoDB)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Ensure database connection is active
    if (mongoose.connection.readyState !== 1) {
      try {
        await connectToMongo();
      } catch (connErr) {
        console.error('Database connection error in register:', connErr.message);
        return res.status(503).json({
          message: 'Database is currently unavailable. Please try again in a few moments.'
        });
      }
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email address already exists. Please sign in.' });
    }

    const role = trimmedEmail === 'admin@doorstep.com' ? 'admin' : 'customer';
    const newUser = new User({
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      role
    });
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully in database',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error registering user', error: error.message });
  }
};

// 2. User Sign In (Validates directly against MongoDB)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Ensure database connection is active
    if (mongoose.connection.readyState !== 1) {
      try {
        await connectToMongo();
      } catch (connErr) {
        console.warn('Database connection notice in login:', connErr.message);
      }
    }

    // Check for Master Admin built-in login
    if (trimmedEmail === 'admin@doorstep.com' && password === 'admin123') {
      let adminId = 'admin-root';
      if (mongoose.connection.readyState === 1) {
        try {
          let adminUser = await User.findOne({ email: trimmedEmail });
          if (!adminUser) {
            adminUser = new User({
              name: 'Master Admin',
              email: 'admin@doorstep.com',
              password: 'admin123',
              role: 'admin'
            });
            await adminUser.save();
          }
          adminId = adminUser._id;
        } catch (e) {
          console.warn("DB notice during admin login:", e.message);
        }
      }
      return res.status(200).json({
        success: true,
        user: {
          _id: adminId,
          name: 'Master Admin',
          email: 'admin@doorstep.com',
          role: 'admin'
        }
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: trimmedEmail, password: password });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    }

    return res.status(503).json({
      message: 'Database connection in progress. Please retry in a few seconds.'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during sign in', error: error.message });
  }
};

// 3. Get all registered users (For admin inspection)
export const getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToMongo();
    }
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};
