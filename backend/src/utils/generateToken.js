import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict', // 'none' needed for cross-origin frontend/backend
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const generateGuestToken = (res, guestId) => {
  const token = jwt.sign({ guestId, role: 'guest' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
