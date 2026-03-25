const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../client/public/uploads")));


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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: {
    type: String
  },
  tagline: {
    type: String,
    maxlength: 100,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  languages: {
    type: String,
    default: 'English, Filipino'
  },
  profileimage: { 
    type: String 
  },
  paymentMethods: {
    type: [String],
    default: ['Cash']
  },
  contactInfo: {
    facebook: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    other: { type: String, default: '' }
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
  userprofileid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile"
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

// Category Schema for Admin Dashboard
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    default: '📁'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Comments Schema
const commentSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  freelancerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  freelancername: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userrating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  usercomment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
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
const Category = mongoose.model("Category", categorySchema);
const Comment = mongoose.model("Comment", commentSchema);

// Seed default categories if none exist
const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('No categories found. Seeding default categories...');
      const defaultCategories = [
        { name: 'Visual Arts', icon: '🎨', description: 'Design, illustration, photography' },
        { name: 'Academic Help', icon: '📚', description: 'Tutoring, research, editing' },
        { name: 'Video Editing', icon: '🎬', description: 'Production, post-processing' },
        { name: 'Programming', icon: '💻', description: 'Web, mobile, software' },
        { name: 'Marketing', icon: '📊', description: 'Social media, SEO, content' },
        { name: 'Music & Audio', icon: '🎵', description: 'Production, Mixing, Voice-over' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Default categories seeded successfully!');
    } else {
      console.log(`Found ${count} existing categories.`);
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Call the seed function after database connection is established
setTimeout(() => {
  seedDefaultCategories();
}, 1000);

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

// Helper function to check if user is admin
const isAdmin = async (userId) => {
  const user = await User.findById(userId);
  // List of admin emails
  const adminEmails = [
    'carlo_barreo@dlsu.edu.ph',
    'daniel_rebudiao@dlsu.edu.ph',
    'francis_balcruz@dlsu.edu.ph',
    'anna_papa@dlsu.edu.ph'
  ];
  return adminEmails.includes(user?.email);
};



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
        tagline: '',
        languages: 'English, Filipino',
        paymentMethods: ['Cash'],
        contactInfo: {
          facebook: '',
          email: user.email,
          phone: '',
          other: ''
        },
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
        : `/uploads/${profile.profileimage}`
      : '/assets/default-avatar.jpg';

    res.json({
      email: req.user.email,
      username: profile.username,
      profileimage: profileImageUrl,
      firstname: profile.username?.split('_')[0] || '',
      lastname: profile.username?.split('_')[1] || '',
      bio: profile.bio || 'DLSU student passionate about freelancing.',
      tagline: profile.tagline || '',
      location: profile.location || 'Manila, Philippines',
      languages: profile.languages || 'English, Filipino',
      paymentMethods: profile.paymentMethods || ['Cash'],
      contactInfo: profile.contactInfo || {
        facebook: '',
        email: req.user.email,
        phone: '',
        other: ''
      },
      totalprojects: totalprojects || profile.totalprojects || 0,
      totalearned: totalearned || profile.totalearned || 0,
      averagerating: parseFloat(averagerating) || profile.averagerating || 0,
      createdAt: profile.createdAt
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
    const serviceSchema = await Service.find()
                          .populate('userid', 'username')
                          .populate('userprofileid', 'profileimage');
    
    const services = serviceSchema.map(service => ({
      userid: {
        username: service.userid.username,
        _id: service.userid._id
      },
      userprofileid: {
        profileimage: service.userprofileid.profileimage || '/assets/default-avatar.jpg',
        _id: service.userprofileid?._id || null
      },
      title: service.title,
      category: service.category,
      description: service.description,
      startingprice: service.startingprice,
      pricetype: service.pricetype,
      deliverytime: service.deliverytime,
      experiencelevel: service.experiencelevel,
      image: service.image.map(img => `http://localhost:5000/${img}`)
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




// ==================== ADMIN CATEGORY MANAGEMENT ENDPOINTS ====================

// *****************************************************************************************************************
// Admin - Get all categories
// *****************************************************************************************************************
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!await isAdmin(req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const categories = await Category.find().sort({ createdAt: -1 });
    
    // Get service count for each category
    const categoriesWithCount = await Promise.all(categories.map(async (category) => {
      const serviceCount = await Service.countDocuments({ category: category.name });
      return {
        _id: category._id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        serviceCount: serviceCount,
        createdAt: category.createdAt
      };
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// *****************************************************************************************************************
// Admin - Create new category
// *****************************************************************************************************************
app.post('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!await isAdmin(req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { name, icon, description } = req.body;

    // Validate input
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    // Create new category
    const category = new Category({
      name: name.trim(),
      icon: icon || '📁',
      description: description || ''
    });

    await category.save();

    res.json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// *****************************************************************************************************************
// Admin - Update category
// *****************************************************************************************************************
app.put('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!await isAdmin(req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { name, icon, description } = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if new name conflicts with existing category (excluding current one)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name?.trim() || category.name,
        icon: icon || category.icon,
        description: description !== undefined ? description : category.description
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// *****************************************************************************************************************
// Admin - Delete category
// *****************************************************************************************************************
app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!await isAdmin(req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category is being used by any service
    const servicesUsingCategory = await Service.countDocuments({ category: category.name });
    if (servicesUsingCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. It is used by ${servicesUsingCategory} service(s).` 
      });
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// *****************************************************************************************************************
// Public - Get all categories (for frontend dropdowns)
// *****************************************************************************************************************
app.get('/api/public/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // If no categories in DB, return default list
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Visual Arts', icon: '🎨', description: 'Design, illustration, photography' },
        { name: 'Academic Help', icon: '📚', description: 'Tutoring, research, editing' },
        { name: 'Video Editing', icon: '🎬', description: 'Production, post-processing' },
        { name: 'Programming', icon: '💻', description: 'Web, mobile, software' },
        { name: 'Marketing', icon: '📊', description: 'Social media, SEO, content' },
        { name: 'Music & Audio', icon: '🎵', description: 'Production, Mixing, Voice-over' }
      ];
      return res.json({ success: true, data: defaultCategories });
    }
    
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching public categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== END ADMIN CATEGORY MANAGEMENT ====================



// *****************************************************************************************************************
// Post a Service
// *****************************************************************************************************************
// Post Service
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../client/public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/addservice", authenticateToken, upload.array("images"), async (req, res) => {
  try {  
    const userid = req.user.userId; // get userid from token
    const imagePaths = req.files.map(file => `uploads/${file.filename}`);

    const userProfile = await UserProfile.findOne({ userid });
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const comment = new Comment({
      userid,
      userprofileid: userProfile._id,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      startingprice: req.body.startingprice,
      pricetype: req.body.pricetype,
      deliverytime: req.body.deliverytime,
      experiencelevel: req.body.experiencelevel,
      image: imagePaths, // array of file paths
    });
  
    await service.save();
    res.json({ message: "Service posted successfully!" });
  } catch (err) {
    console.error("Error posting service:", err);
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
      .populate('userprofileid', 'profileimage')
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
        userprofileid: {
          profileimage: service.userprofileid.profileimage || '/assets/default-avatar.jpg',
          _id: service.userprofileid?._id || null
        },
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

// Get unique categories for filter dropdown (updated to use Category collection)
app.get('/api/service-categories', authenticateToken, async (req, res) => {
  try {
    // First try to get categories from Category collection
    const categoriesFromDB = await Category.find().sort({ name: 1 });
    
    if (categoriesFromDB.length > 0) {
      const categoryNames = categoriesFromDB.map(cat => cat.name);
      return res.json({
        success: true,
        data: categoryNames
      });
    }
    
    // Fallback to getting distinct from services
    const categoriesFromServices = await Service.distinct('category');
    
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
    const allCategories = [...new Set([...categoriesFromServices, ...defaultCategories])];
    
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


// *****************************************************************************************************************
// Update User Profile
// *****************************************************************************************************************
app.put('/api/update-profile', authenticateToken, async (req, res) => {
  try {
    const { 
      username, 
      tagline, 
      bio, 
      location, 
      languages,
      paymentMethods,
      contactInfo 
    } = req.body;
    const userId = req.user.userId;

    // Find and update the user profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userid: userId },
      { 
        username: username,
        tagline: tagline,
        bio: bio,
        location: location,
        languages: languages,
        paymentMethods: paymentMethods,
        contactInfo: contactInfo
      },
      { new: true, upsert: true }
    );

    // Also update the username in the User collection if needed
    await User.findByIdAndUpdate(
      userId,
      { username: username },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile' 
    });
  }
});

// *****************************************************************************************************************
// Get Freelancer Contact Info (for Hire Now popup)
// *****************************************************************************************************************
app.get('/api/get-freelancer-contact/:userId', authenticateToken, async (req, res) => {
  try {
    const freelancerId = req.params.userId;
    
    // Find the freelancer's profile
    const profile = await UserProfile.findOne({ userid: freelancerId })
      .populate('userid', 'username email');
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Freelancer not found' 
      });
    }

    // Get the user info
    const user = await User.findById(freelancerId);

    // Format response
    res.json({
      success: true,
      data: {
        freelancerId: freelancerId,
        name: profile.username || user?.username || 'Freelancer',
        profileimage: profile.profileimage || '/assets/default-avatar.jpg',
        paymentMethods: profile.paymentMethods || ['Cash'],
        contactInfo: {
          facebook: profile.contactInfo?.facebook || '',
          email: profile.contactInfo?.email || user?.email || '',
          phone: profile.contactInfo?.phone || '',
          other: profile.contactInfo?.other || ''
        }
      }
    });

  } catch (error) {
    console.error('Error fetching freelancer contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// *****************************************************************************************************************
// Ratings and Comments
// *****************************************************************************************************************
// Get Comments
app.get('/api/comments/:freelancerId', async (req, res) => {
  try {
    console.log('Fetching comments for freelancerId:', req.params.freelancerId);
    
    const comments = await Comment.find({
      freelancerid: req.params.freelancerId
    }).sort({ createdAt: -1 });
    
    console.log('Found comments:', comments.length);
    res.json(comments);
  } catch (error) {  // Added 'error' parameter
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Post Comment
app.post('/api/comments', async (req, res) => {
  try {
    const { freelancerid, freelancername, usercomment, userrating, username, userid } = req.body;
    
    // Validate required fields
    if (!freelancerid) {
      return res.status(400).json({ message: 'Missing required field: Freelancer Id' });
    }
    if (!usercomment) {
      return res.status(400).json({ message: 'Missing required field: Comment' });
    }
    if (!userrating) {
      return res.status(400).json({ message: 'Missing required field: Rating' });
    }
    if (!username) {
      return res.status(400).json({ message: 'Missing required field: User Name' });
    }
    
    // Create new comment
    const newComment = new Comment({
      userid: userid || new mongoose.Types.ObjectId(), // If no userId, create temporary one
      freelancerid: freelancerid,
      freelancername: freelancername,
      username: username || 'Guest User',
      userrating: userrating,
      usercomment: usercomment
    });
    
    await newComment.save();
    
    // Update freelancer's average rating
    const allComments = await Comment.find({ freelancerid: freelancerid });
    const averageRating = allComments.reduce((sum, c) => sum + c.userrating, 0) / allComments.length;
    
    await UserProfile.findOneAndUpdate(
      { userid: freelancerid },
      { averagerating: averageRating }
    );
    
    res.status(201).json({ 
      message: 'Comment posted successfully', 
      comment: newComment,
      averageRating: averageRating
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Error posting comment', error: error.message });
  }
});

// Delete comment
app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Update comment
app.put('/api/comments/:commentId', async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { 
        usercomment: comment, 
        userrating: rating,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.json({ message: 'Comment updated successfully', comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// *****************************************************************************************************************
// DON'T MOVE
// *****************************************************************************************************************
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});