import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        requiresPasswordChange: user.requiresPasswordChange,
        favorites: user.favorites,
        recentSearches: user.recentSearches,
        preferences: user.preferences,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        requiresPasswordChange: user.requiresPasswordChange,
        favorites: user.favorites,
        recentSearches: user.recentSearches,
        preferences: user.preferences,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        requiresPasswordChange: user.requiresPasswordChange,
        favorites: user.favorites,
        recentSearches: user.recentSearches,
        preferences: user.preferences,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (favorites, recents, settings)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.avatar = req.body.avatar || user.avatar;
      
      if (req.body.favorites !== undefined) {
        user.favorites = req.body.favorites;
      }
      if (req.body.recentSearches !== undefined) {
        user.recentSearches = req.body.recentSearches;
      }
      if (req.body.preferences) {
        user.preferences = { ...user.preferences, ...req.body.preferences };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        requiresPasswordChange: updatedUser.requiresPasswordChange,
        favorites: updatedUser.favorites,
        recentSearches: updatedUser.recentSearches,
        preferences: updatedUser.preferences,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Temporary development login recovery bypass
// @route   POST /api/auth/dev-login-recovery
// @access  Public (Dev Only)
const devLoginRecovery = async (req, res, next) => {
  if (process.env.NODE_ENV !== 'development' && process.env.ENABLE_DEV_LOGIN_RECOVERY !== 'true') {
    res.status(403);
    return next(new Error('This endpoint is disabled in production.'));
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found.' });
    }

    user.requiresPasswordChange = true;
    await user.save();

    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      requiresPasswordChange: user.requiresPasswordChange,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Force password change for recovered sessions
// @route   POST /api/auth/force-password-change
// @access  Private
const forcePasswordChange = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!password || password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    user.password = password;
    user.requiresPasswordChange = false;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      requiresPasswordChange: user.requiresPasswordChange,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, devLoginRecovery, forcePasswordChange };
