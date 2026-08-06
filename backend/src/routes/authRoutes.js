import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  devLoginRecovery,
  forcePasswordChange,
  generateGuestSession,
} from '../controllers/authController.js';
import {
  getWebAuthnRegistration,
  verifyWebAuthnRegistration,
  getWebAuthnAuthentication,
  verifyWebAuthnAuthentication,
  generateRecoveryCodes,
  verifyRecoveryCode,
} from '../controllers/recoveryController.js';
import { protect, requireGuestOrAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile); // Strictly for registered users
router.put('/profile', protect, updateUserProfile);
router.post('/dev-login-recovery', devLoginRecovery);
router.post('/force-password-change', protect, forcePasswordChange);
router.post('/guest', generateGuestSession);

// WebAuthn Passkeys
router.get('/webauthn/register', protect, getWebAuthnRegistration);
router.post('/webauthn/register', protect, verifyWebAuthnRegistration);
router.post('/webauthn/authenticate-options', getWebAuthnAuthentication); // Public
router.post('/webauthn/authenticate', verifyWebAuthnAuthentication); // Public

// Recovery Codes
router.post('/recovery-codes', protect, generateRecoveryCodes);
router.post('/verify-recovery-code', verifyRecoveryCode); // Public

export default router;
