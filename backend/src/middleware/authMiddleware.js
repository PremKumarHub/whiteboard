const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'zansphere_whiteboard_secret_key_2026_super_secure'
      );
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return sendError(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }
};

const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'zansphere_whiteboard_secret_key_2026_super_secure'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user attached if token invalid
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };
