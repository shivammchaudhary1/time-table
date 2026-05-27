import mongoose from 'mongoose';
import { ROLE, STATUS } from '../utils/constant.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Never return password in queries by default
    },
    accessToken: {
      type: String,
      select: false, // Don't include in regular queries for security
    },
    accessTokenExpiry: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpiry: {
      type: Date,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    profilePicture: {
      type: String,
      default: null,
      match: [/^(https?:\/\/.+)?$/, 'Please provide a valid URL for profile picture'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[\d+\-() ]{7,}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.USER, ROLE.MODERATOR],
      default: ROLE.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING, STATUS.DELETED],
      default: STATUS.ACTIVE,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true },
    versionKey: false, // Remove __v field
  }
);

// ========== INDEXES ==========

userSchema.index({ email: 1 }); // Fast email lookup
userSchema.index({ createdAt: -1 }); // Fast sorting by creation date
userSchema.index({ role: 1 }); // Fast role-based queries

export default mongoose.model('User', userSchema);
