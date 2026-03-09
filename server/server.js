const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId, // Foreign Key
    ref: "User", // Reference to User Schema
    required: true
  },
  username: { 
    type: String, 
    unique: true 
  },
  bio: {
    type: String,
    maxlength: 200
  },
  profileimage: { 
    type: String 
  },
  totalearned: { 
    type: Number, 
    default: 0 
  },
  totalprojects: { 
    type: Number, 
    default: 0 
  },
  averagerating: { 
    type: Number, 
    default: 0 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Pre-save middleware to automatically set username from User
userProfileSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('userid')) {
    try {
      const user = await mongoose.model('User').findById(this.userid);
      if (user) {
        this.username = user.username;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});



// API ROUTES

// *****************************************************************************************************************
// Register (Create Account)
// *****************************************************************************************************************
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

// *****************************************************************************************************************
// Login
// *****************************************************************************************************************
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET || 'grabekanacarlo',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful!',
      token: token,
      user: { 
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});


// *****************************************************************************************************************
// Authentication Routes
// *****************************************************************************************************************
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token is valid',
    user: req.user 
  });
});


// *****************************************************************************************************************
// Homepage
// *****************************************************************************************************************
// Get user profile
app.get('/api/get-profile', authenticateToken, async (req, res) => {
  try {
    // Try to get profile from UserProfile first
    let profile = await UserProfile.findOne({ userid: req.user.userId });
    
    // If no profile exists, create one
    if (!profile) {
      const user = await User.findById(req.user.userId);
      profile = new UserProfile({
        userid: user._id,
        username: user.username,
        bio: '',
        location: '',
        website: '',
        profileimage: null
      });
      await profile.save();
    }
    
    res.json({
      email: req.user.email,
      username: profile.username,
      profileimage: profile.profileimage,
      firstname: profile.username?.split('_')[0] || '',
      lastname: profile.username?.split('_')[1] || '',
      bio: profile.bio,
      location: profile.location,
      website: profile.website
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics
app.get('/api/get-statistics', authenticateToken, async (req, res) => {
  try {
    // You'll need to create these collections or calculate from your data
    // For now, return mock data
    res.json({
      totalActiveUsers: await User.countDocuments(),
      totalServices: 150, // Replace with actual count
      averageRating: 4.8 // Replace with actual average
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get freelancers
app.get('/api/get-freelancers', authenticateToken, async (req, res) => {
  try {
    // Get all user profiles
    const profiles = await UserProfile.find().populate('userid', 'email').limit(10);
    
    const freelancers = profiles.map(profile => ({
      userid: {
        username: profile.username,
        _id: profile.userid._id
      },
      firstname: profile.username?.split('_')[0] || 'First',
      lastname: profile.username?.split('_')[1] || 'Last',
      profileimage: profile.profileimage,
      totalearned: profile.totalearned || 0,
      totalprojects: profile.totalprojects || 0,
      averagerating: profile.averagerating || 0,
      bio: profile.bio || `DLSU student passionate about freelancing.`,
      projects: [] // Add actual projects if you have them
    }));
    
    res.json(freelancers);
  } catch (error) {
    console.error('Freelancers error:', error);
    res.status(500).json({ error: 'Server error' });
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