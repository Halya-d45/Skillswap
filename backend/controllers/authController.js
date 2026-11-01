import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper to generate a signed JWT token
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'skillswap_dev_secret_key_change_in_production_2025';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      skillsToTeach,
      skillsTeach,
      skillsToLearn,
      skillsLearn,
      bio,
      profileImage,
      avatar,
      location,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Normalize skills arrays
    const teachSkills = skillsToTeach || skillsTeach || [];
    const learnSkills = skillsToLearn || skillsLearn || [];

    const normalizedTeach = Array.isArray(teachSkills)
      ? teachSkills
      : String(teachSkills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const normalizedLearn = Array.isArray(learnSkills)
      ? learnSkills
      : String(learnSkills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    // Create user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      skillsToTeach: normalizedTeach,
      skillsToLearn: normalizedLearn,
      bio: bio || 'Eager to exchange skills and learn with the SkillSwap community!',
      profileImage:
        profileImage ||
        avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      location: location || 'Remote',
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        avatar: user.profileImage,
        location: user.location,
        skillsToTeach: user.skillsToTeach,
        skillsTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillsLearn: user.skillsToLearn,
        swapsCompleted: user.swapsCompleted,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        avatar: user.profileImage,
        location: user.location,
        skillsToTeach: user.skillsToTeach,
        skillsTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillsLearn: user.skillsToLearn,
        swapsCompleted: user.swapsCompleted,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        avatar: user.profileImage,
        location: user.location,
        skillsToTeach: user.skillsToTeach,
        skillsTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillsLearn: user.skillsToLearn,
        swapsCompleted: user.swapsCompleted,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name !== undefined ? req.body.name.trim() : user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio.trim() : user.bio;
    user.location = req.body.location !== undefined ? req.body.location.trim() : user.location;
    user.profileImage = req.body.profileImage || req.body.avatar || user.profileImage;

    // Handle skillsToTeach
    if (req.body.skillsToTeach !== undefined || req.body.skillsTeach !== undefined) {
      const teach = req.body.skillsToTeach !== undefined ? req.body.skillsToTeach : req.body.skillsTeach;
      user.skillsToTeach = Array.isArray(teach)
        ? teach
        : String(teach).split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Handle skillsToLearn
    if (req.body.skillsToLearn !== undefined || req.body.skillsLearn !== undefined) {
      const learn = req.body.skillsToLearn !== undefined ? req.body.skillsToLearn : req.body.skillsLearn;
      user.skillsToLearn = Array.isArray(learn)
        ? learn
        : String(learn).split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Optional password change
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      avatar: updatedUser.profileImage,
      location: updatedUser.location,
      skillsToTeach: updatedUser.skillsToTeach,
      skillsTeach: updatedUser.skillsToTeach,
      skillsToLearn: updatedUser.skillsToLearn,
      skillsLearn: updatedUser.skillsToLearn,
      swapsCompleted: updatedUser.swapsCompleted,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    return res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

/**
 * @desc    Get all registered community members
 * @route   GET /api/auth/users
 * @access  Public
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

