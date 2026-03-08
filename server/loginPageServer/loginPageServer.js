const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to validate DLSU email
const isValidDLSUEmail = (email) => {
  const dlsuEmailPattern = /^[a-zA-Z]+_[a-zA-Z]+@dlsu\.edu\.ph$/;
  return dlsuEmailPattern.test(email);
};

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  username: { 
    type: String, 
    unique: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// API Routes

// Register (Create Account)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate DLSU email format
    if (!isValidDLSUEmail(email)) {
      return res.status(400).json({ error: 'Only DLSU emails (first_last@dlsu.edu.ph) are allowed' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      username
    });

    await user.save();

    res.status(201).json({ 
      message: 'Account created successfully!',
      user: { 
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate DLSU email format
    if (!isValidDLSUEmail(email)) {
      return res.status(400).json({ error: 'Only DLSU emails (first_last@dlsu.edu.ph) are allowed' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ 
      message: 'Login successful!',
      user: { 
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});