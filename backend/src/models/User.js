import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['guest', 'user', 'premium', 'admin', 'moderator'],
      default: 'user',
    },
    passkeys: [
      {
        credentialID: Buffer,
        credentialPublicKey: Buffer,
        counter: Number,
        transports: [String]
      }
    ],
    recoveryCodes: [
      {
        codeHash: String,
        used: { type: Boolean, default: false }
      }
    ],
    hasRecoverySetup: {
      type: Boolean,
      default: false,
    },
    webAuthnChallenge: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    requiresPasswordChange: {
      type: Boolean,
      default: false,
    },
    favorites: {
      type: [String],
      default: [],
    },
    recentSearches: {
      type: [String],
      default: [],
    },
    preferences: {
      units: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric'
      },
      notifications: {
        weatherAlerts: { type: Boolean, default: false },
        dailyForecast: { type: Boolean, default: false },
        severeWarnings: { type: Boolean, default: false },
        communityUpdates: { type: Boolean, default: false },
        emailAlerts: { type: Boolean, default: false },
        pushAlerts: { type: Boolean, default: false }
      }
    },
    pushSubscription: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash the password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
