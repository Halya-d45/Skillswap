import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../config/email.js';

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
 * Helper to generate a random 6-digit OTP string
 */
const generateSixDigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register a new user (generates & emails verification OTP)
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
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

    // Save registered user directly in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      skillsToTeach: normalizedTeach,
      skillsToLearn: normalizedLearn,
      bio: bio || 'Eager to exchange skills and learn with the SkillSwap community!',
      profileImage:
        profileImage ||
        avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      location: location || 'Remote',
      isVerified: true,
    });

    const token = generateToken(user._id);

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
      isVerified: user.isVerified,
      token,
      message: 'Registration successful! Welcome to SkillSwap.',
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * @desc    Verify email using 6-digit OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide both email and 6-digit OTP' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This email is already verified. You can log in directly.' });
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      return res.status(400).json({ message: 'No pending verification code found. Please request a new OTP.' });
    }

    // Check maximum attempts limit (max 5)
    if (user.verificationAttempts >= 5) {
      return res.status(400).json({
        message: 'Too many incorrect attempts. For security, please request a new verification OTP.',
      });
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(user.verificationOtpExpires)) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new OTP.',
      });
    }

    // Verify OTP using bcrypt comparison
    const isMatch = await bcrypt.compare(otp.trim(), user.verificationOtp);
    if (!isMatch) {
      user.verificationAttempts += 1;
      await user.save();
      const remainingAttempts = Math.max(0, 5 - user.verificationAttempts);
      return res.status(400).json({
        message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // Mark as verified & clear OTP fields
    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    user.verificationAttempts = 0;
    user.otpLastSentAt = null;
    await user.save();

    // Send Welcome Email upon successful verification
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (mailErr) {
      console.error('Welcome email delivery error:', mailErr.message);
    }

    // Now issue JWT token and return user data for login
    return res.status(200).json({
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
      isVerified: user.isVerified,
      token: generateToken(user._id),
      message: 'Email successfully verified! Welcome to SkillSwap.',
    });
  } catch (error) {
    console.error('Email Verification Error:', error.message);
    return res.status(500).json({ message: 'Server error during email verification', error: error.message });
  }
};

/**
 * @desc    Resend registration verification OTP with 60s cooldown
 * @route   POST /api/auth/resend-verification-otp
 * @access  Public
 */
export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Account not found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please log in directly.' });
    }

    // Check resend cooldown of 60 seconds
    const now = Date.now();
    if (user.otpLastSentAt) {
      const elapsedMs = now - new Date(user.otpLastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSec} second(s) before requesting another code.`,
          remainingSeconds: remainingSec,
        });
      }
    }

    // Generate new OTP & hash it
    const otp = generateSixDigitOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.verificationOtp = hashedOtp;
    user.verificationOtpExpires = new Date(now + 5 * 60 * 1000); // 5 mins
    user.verificationAttempts = 0;
    user.otpLastSentAt = new Date(now);
    await user.save();

    // Send email via Resend HTTP API
    let emailResult;
    try {
      emailResult = await sendVerificationEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('Failed to resend verification email:', mailErr.message);
      emailResult = { success: false, error: mailErr.message };
    }

    if (!emailResult || !emailResult.success) {
      user.otpLastSentAt = null;
      await user.save();

      return res.status(500).json({
        message: 'Failed to resend verification email. Please try again.',
        error: emailResult?.error || 'Email delivery failed',
      });
    }

    return res.status(200).json({
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend Verification OTP Error:', error.message);
    return res.status(500).json({ message: 'Server error resending OTP', error: error.message });
  }
};

/**
 * @desc    Initiate forgot password flow (generates & emails reset OTP)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your registered email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Consistent response message to avoid account enumeration
    const genericResponse = {
      message: 'If an account exists with that email address, a password reset code has been sent.',
    };

    if (!user) {
      // Do not disclose whether email exists
      return res.status(200).json(genericResponse);
    }

    // Check 60-second cooldown on reset requests
    const now = Date.now();
    if (user.resetPasswordOtpLastSentAt) {
      const elapsedMs = now - new Date(user.resetPasswordOtpLastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSec} second(s) before requesting another reset code.`,
          remainingSeconds: remainingSec,
        });
      }
    }

    // Generate 6-digit OTP & hash it
    const otp = generateSixDigitOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = new Date(now + 5 * 60 * 1000); // 5 mins
    user.resetPasswordAttempts = 0;
    user.resetPasswordOtpLastSentAt = new Date(now);
    await user.save();

    // Send reset email via Resend HTTP API
    let emailResult;
    try {
      emailResult = await sendPasswordResetEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('Error sending reset email:', mailErr.message);
      emailResult = { success: false, error: mailErr.message };
    }

    if (!emailResult || !emailResult.success) {
      user.resetPasswordOtpLastSentAt = null;
      await user.save();

      return res.status(500).json({
        message: 'Failed to deliver password reset email. Please try again later.',
        error: emailResult?.error || 'Email delivery failed',
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    return res.status(500).json({ message: 'Server error processing password reset', error: error.message });
  }
};

/**
 * @desc    Reset password using email, OTP and new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, reset OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired password reset request. Please request a new code.' });
    }

    // Check maximum attempts limit (max 5)
    if (user.resetPasswordAttempts >= 5) {
      return res.status(400).json({
        message: 'Too many incorrect attempts. Please request a new password reset code.',
      });
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(user.resetPasswordOtpExpires)) {
      return res.status(400).json({
        message: 'Reset code has expired. Please request a new password reset code.',
      });
    }

    // Verify OTP using bcrypt comparison
    const isMatch = await bcrypt.compare(otp.trim(), user.resetPasswordOtp);
    if (!isMatch) {
      user.resetPasswordAttempts += 1;
      await user.save();
      const remainingAttempts = Math.max(0, 5 - user.resetPasswordAttempts);
      return res.status(400).json({
        message: `Invalid reset code. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // Hash new password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Invalidate reset OTP fields
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    user.resetPasswordAttempts = 0;
    user.resetPasswordOtpLastSentAt = null;

    // Ensure account is verified if completing reset
    if (user.isVerified === false) {
      user.isVerified = true;
    }

    await user.save();

    return res.status(200).json({
      message: 'Password has been successfully reset! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    return res.status(500).json({ message: 'Server error resetting password', error: error.message });
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ensure any previously unverified user account is verified
    if (user.isVerified === false) {
      user.isVerified = true;
      await user.save();
    }

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
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
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
        isVerified: user.isVerified,
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
      isVerified: updatedUser.isVerified,
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
