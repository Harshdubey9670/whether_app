import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const getRPID = () => process.env.NODE_ENV === 'production' ? process.env.WEBAUTHN_RP_ID : 'localhost';
const getOrigin = () => process.env.NODE_ENV === 'production' ? process.env.WEBAUTHN_ORIGIN : 'http://localhost:5173';
const rpName = 'Weather App';

// @desc    Generate WebAuthn Registration Options
// @route   GET /api/auth/webauthn/register
// @access  Private
export const getWebAuthnRegistration = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const options = await generateRegistrationOptions({
      rpName,
      rpID: getRPID(),
      userID: user.email,
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: user.passkeys.map(key => ({
        id: key.credentialID,
        type: 'public-key',
        transports: key.transports,
      })),
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'preferred',
      },
    });

    user.webAuthnChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify WebAuthn Registration
// @route   POST /api/auth/webauthn/register
// @access  Private
export const verifyWebAuthnRegistration = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRPID(),
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      user.passkeys.push({
        credentialID,
        credentialPublicKey,
        counter,
        transports: req.body.response.transports || [],
      });
      user.hasRecoverySetup = true;
      user.webAuthnChallenge = null;
      await user.save();

      res.json({ verified: true, message: 'Passkey registered successfully' });
    } else {
      res.status(400).json({ verified: false, message: 'Verification failed' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Generate WebAuthn Authentication Options
// @route   POST /api/auth/webauthn/authenticate-options
// @access  Public
export const getWebAuthnAuthentication = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const options = await generateAuthenticationOptions({
      rpID: getRPID(),
      allowCredentials: user.passkeys.map(key => ({
        id: key.credentialID,
        type: 'public-key',
        transports: key.transports,
      })),
      userVerification: 'preferred',
    });

    user.webAuthnChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify WebAuthn Authentication (Login/Recovery)
// @route   POST /api/auth/webauthn/authenticate
// @access  Public
export const verifyWebAuthnAuthentication = async (req, res, next) => {
  try {
    const { email, response } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const expectedChallenge = user.webAuthnChallenge;
    if (!expectedChallenge) return res.status(400).json({ message: 'Challenge not found' });

    // Find the matching passkey
    const passkey = user.passkeys.find(k => 
      Buffer.from(k.credentialID).toString('base64url') === response.id
    );

    if (!passkey) return res.status(404).json({ message: 'Passkey not found for this user' });

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRPID(),
      authenticator: {
        credentialPublicKey: passkey.credentialPublicKey,
        credentialID: passkey.credentialID,
        counter: passkey.counter,
      },
    });

    if (verification.verified) {
      passkey.counter = verification.authenticationInfo.newCounter;
      user.webAuthnChallenge = null;
      user.requiresPasswordChange = true; // They need to set a new password since they recovered
      await user.save();

      generateToken(res, user._id); // Log them in automatically

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        requiresPasswordChange: user.requiresPasswordChange,
        verified: true,
      });
    } else {
      res.status(400).json({ verified: false, message: 'Authentication failed' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Recovery Codes
// @route   POST /api/auth/recovery-codes
// @access  Private
export const generateRecoveryCodes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const codes = [];
    const hashedCodes = [];

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
      const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
      codes.push(formattedCode);

      const hash = crypto.createHash('sha256').update(formattedCode).digest('hex');
      hashedCodes.push({ codeHash: hash, used: false });
    }

    user.recoveryCodes = hashedCodes;
    user.hasRecoverySetup = true;
    await user.save();

    res.json({ codes });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Recovery Code for Password Reset
// @route   POST /api/auth/verify-recovery-code
// @access  Public
export const verifyRecoveryCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hash = crypto.createHash('sha256').update(code).digest('hex');

    const codeIndex = user.recoveryCodes.findIndex(c => c.codeHash === hash && !c.used);

    if (codeIndex === -1) {
      return res.status(400).json({ message: 'Invalid or already used recovery code' });
    }

    // Mark as used
    user.recoveryCodes[codeIndex].used = true;
    user.requiresPasswordChange = true;
    await user.save();

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};
