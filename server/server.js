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

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId, // Foreign Key
    ref: "User", // Reference to User Schema
    required: true
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

// Service schema - contains the list of services posted by freelancers. Each service is linked to a freelancer (user).
// This will be used in the freelancer's dashboard to show the list of services they have posted and their details 
// (title, category, description, starting price, delivery time, experience level, etc.)
const serviceSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId, // foreign key
    ref: "User",                          // reference to User collection
    required: true
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true, maxlength: 2000 },
  startingprice: { type: Number, required: true },
  pricetype: { type: String, required: true },
  deliverytime: { type: String, required: true },
  experiencelevel: { type: String, required: true },
  image: [{ type: String }]
});

// Projects schema - contains the list of projects posted by hirers and assigned to freelancers. 
// Each project is linked to a service and a hirer (user).
const projectSchema = new mongoose.Schema({
  userid: {                               // this is the freelancer assigned to the project
    type: mongoose.Schema.Types.ObjectId, // foreign key
    ref: "User",                          // reference to User collection
    required: true
  },
  hirerid: {                              // this is the hirer who posted the project
    type: mongoose.Schema.Types.ObjectId, // foreign key
    ref: "User",                          // reference to User collection
    required: true
  },
  serviceid: {                            // this is the service that the project is based on
    type: mongoose.Schema.Types.ObjectId, // foreign key
    ref: "Service",                       // reference to Service collection
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true, maxlength: 2000 },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, default: "open" },
  rating: { type: Number, default: 0 },
  projectimages: [{ type: String }]
});

// Add the virtual schema Projects to User schema
// Used to connect yung projects with the same userid as UserProfile (done with mongoose .populate(), research nalang)
userProfileSchema.virtual("projects", { 
  ref: "Project",
  localField: "userid",
  foreignField: "userid"
});

// Ensure virtuals are included when converting to JSON
userProfileSchema.set('toObject', { virtuals: true });
userProfileSchema.set('toJSON', { virtuals: true });

// Compile Models
const User = mongoose.model('User', userSchema);
const UserProfile = mongoose.model("UserProfile", userProfileSchema);
const Service = mongoose.model("Service", serviceSchema);
const Project = mongoose.model("Project", projectSchema);

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'carlokumag', (err, user) => {
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
app.use('/assets', express.static('../client/public/assets'));

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

    // Calculate actual stats from projects
    const projects = await Project.find({ userid: req.user.userId });
    const totalprojects = projects.length;
    
    const completedProjects = projects.filter(p => p.status === "completed");
    const averagerating = completedProjects.length > 0 
      ? (completedProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / completedProjects.length).toFixed(1)
      : profile.averagerating || 0;
    
    const totalearned = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

    // Set default image path if profileimage is null/empty
    const profileImageUrl = profile.profileimage 
      ? profile.profileimage.startsWith('http') 
        ? profile.profileimage 
        : `/uploads/${profile.profileimage}`  // If stored as filename only
      : '/assets/default-avatar.jpg';  // Default image

    
    res.json({
      email: req.user.email,
      username: profile.username,
      profileimage: profileImageUrl,
      firstname: profile.username?.split('_')[0] || '',
      lastname: profile.username?.split('_')[1] || '',
      bio: profile.bio || 'DLSU student passionate about freelancing.',
      location: profile.location,
      website: profile.website,
      totalprojects: totalprojects || profile.totalprojects || 0,
      totalearned: totalearned || profile.totalearned || 0,
      averagerating: parseFloat(averagerating) || profile.averagerating || 0
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
    const profiles = await UserProfile.find().populate('userid', 'username');
    
    const freelancers = profiles.map(profile => {
      const fullName = profile.userid.username || '';
      const [firstname, ...rest] = fullName.split(' ');
      const lastname = rest.join(' ');  // handles multiple words

    // Set default image path if profileimage is null/empty
    const profileImageUrl = profile.profileimage 
      ? profile.profileimage.startsWith('http') 
        ? profile.profileimage 
        : `/uploads/${profile.profileimage}`  // If stored as filename only
      : '/assets/default-avatar.jpg';  // Default image

      return { 
        userid: {
          username: fullName,
          _id: profile.userid._id
        },
        firstname: firstname || 'First',
        lastname: lastname || 'Last',
        profileimage: profileImageUrl,
        totalearned: profile.totalearned || 0,
        totalprojects: profile.totalprojects || 0,
        averagerating: profile.averagerating || 0,
        bio: profile.bio || `DLSU student passionate about freelancing.`,
        projects: [] // Add actual projects if you have them
      };
    });
    
    res.json(freelancers);
  } catch (error) {
    console.error('Freelancers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Services
app.get('/api/get-services', authenticateToken, async (req, res) => {
  try {
    // Get all users
    const serviceSchema = await Service.find().populate('userid', 'username');
    
    const services = serviceSchema.map(service => ({
      userid: {
        username: service.userid.username,
        _id: service.userid._id
      },
      title: service.title,
      category: service.category,
      description: service.description,
      startingprice: service.startingprice,
      pricetype: service.pricetype,
      deliverytime: service.deliverytime,
      experiencelevel: service.experiencelevel,
      image: []
    }));
    
    res.json(services);
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get services by current user (for profile page)
app.get('/api/get-my-services', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from token
    
    // Find all services where userid matches the current user
    const services = await Service.find({ userid: userId })
      .populate('userid', 'username')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching user services:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// *****************************************************************************************************************
// Post a Service
// *****************************************************************************************************************
// Post Service
app.post("/api/addservice", authenticateToken, async (req, res) => {
  const { title, category, description, startingprice, pricetype, deliverytime, experiencelevel, Image } = req.body;
  const userid = req.user.userId; // get userid from token
  const service = new Service({ 
        userid: userid, title: title, category: category, 
        description: description, startingprice: startingprice, pricetype: pricetype, 
        deliverytime: deliverytime, experiencelevel: experiencelevel, image: Image });

  try {
    await service.save();
    res.json({ message: "Service posted successfully!" });
  } catch (err) {
    console.error("Error posting service:", err);
    console.log("Received data:", { userid, title, category, description, startingprice, pricetype, deliverytime, experiencelevel, Image });
    res.status(500).json({ message: "Error posting service. " + err.message });
  }
});

// Get the list of projects posted by the hirer (user)
// This will be used in the hirer's dashboard to show the list of projects they have posted and their status (open, assigned, completed)
app.get("/api/get-hirer-projects", authenticateToken, async (req, res) => {
  const userid = new mongoose.Types.ObjectId(req.user.userId); // get userid from token - this is the hirer

  const projects = await Project.find({ hirerid: userid }).populate("serviceid").populate("userid", "username");
  res.json(projects);
});


// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//update profile WIP
app.post('/api/editProfile', async (req, res) => {
  await User.findOneAndUpdate(
    { userid: req.params.userid },
    req.body,
    { new: true }
  );
  res.redirect('/api/profile' );
});


// *****************************************************************************************************************
// Search Services
// *****************************************************************************************************************
app.get('/api/search-services', authenticateToken, async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy, page = 1, limit = 10 } = req.query;
    
    // Build search query
    const query = {};
    
    // Text search (case insensitive)
    if (q && q.trim() !== '') {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.startingprice = {};
      if (minPrice) query.startingprice.$gte = Number(minPrice);
      if (maxPrice) query.startingprice.$lte = Number(maxPrice);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    let sortOption = {};
    switch (sortBy) {
      case 'price_low':
        sortOption = { startingprice: 1 };
        break;
      case 'price_high':
        sortOption = { startingprice: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // Default: newest first
    }
    
    // Execute search query with pagination
    const services = await Service.find(query)
      .populate({
        path: 'userid',
        select: 'username email'
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Service.countDocuments(query);
    
    // Format the response with freelancer details
    const formattedServices = services.map(service => {
      // Get freelancer name from username (format: first_last)
      const username = service.userid?.username || '';
      const nameParts = username.split('_');
      const firstName = nameParts[0] || 'Freelancer';
      const lastName = nameParts[1] || '';
      
      return {
        _id: service._id,
        title: service.title,
        category: service.category,
        description: service.description,
        startingprice: service.startingprice,
        pricetype: service.pricetype,
        deliverytime: service.deliverytime,
        experiencelevel: service.experiencelevel,
        image: service.image,
        freelancer: {
          id: service.userid?._id,
          username: username,
          firstName: firstName,
          lastName: lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          email: service.userid?.email
        },
        createdAt: service.createdAt
      };
    });
    
    res.json({
      success: true,
      data: formattedServices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount: totalCount,
        hasMore: skip + formattedServices.length < totalCount
      }
    });
    
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during search' 
    });
  }
});

// Get unique categories for filter dropdown
app.get('/api/service-categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    
    // Ensure we have at least your default categories
    const defaultCategories = [
      'Visual Arts',
      'Academic Help', 
      'Video Editing',
      'Programming',
      'Marketing',
      'Music & Audio'
    ];
    
    // Combine existing categories with defaults (removing duplicates)
    const allCategories = [...new Set([...categories, ...defaultCategories])];
    
    res.json({
      success: true,
      data: allCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories even if database fails
    res.json({
      success: true,
      data: [
        'Visual Arts',
        'Academic Help',
        'Video Editing', 
        'Programming',
        'Marketing',
        'Music & Audio'
      ]
    });
  }
});