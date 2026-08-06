import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role === 'guest') {
        res.status(403);
        return next(new Error('Guest accounts are not permitted to access this resource'));
      }

      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user no longer exists'));
      }
      
      next();
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

const requireGuestOrAuth = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role === 'guest') {
        req.user = { _id: decoded.guestId, role: 'guest', name: 'Guest User', isGuest: true };
        return next();
      }

      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user no longer exists'));
      }
      
      next();
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403);
      next(new Error(`Role not authorized. Required: ${roles.join(', ')}`));
    }
  };
};

export { protect, requireGuestOrAuth, admin, requireRole };
