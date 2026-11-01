import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Protects private routes by verifying JWT tokens sent in the Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if Bearer token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const jwtSecret = process.env.JWT_SECRET || 'skillswap_default_jwt_secret';
      const decoded = jwt.verify(token, jwtSecret);

      // Attach user document (excluding password) to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found or deleted' });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
