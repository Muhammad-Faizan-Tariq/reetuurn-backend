import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

// OTP Subschema
const otpSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      minlength: 6,
      maxlength: 6,
    },
    expiry: {
      type: Date,
      default: null,
    },
    purpose: {
      type: String,
      enum: ["verification", "passwordReset", "phoneVerification"],
    },
  },
  { _id: false }
);

// Password History Subschema
const passwordHistorySchema = new mongoose.Schema(
  {
    password: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Main AuthUser Schema
const authUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name must not exceed 50 characters"],
      match: [/^[a-zA-Z ]+$/, "Name can only contain letters and spaces"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordHistory: [passwordHistorySchema],
    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    userType: {
      type: String,
      enum: ["customer", "driver", "admin"],
      default: "customer",
    },
    otp: { type: otpSchema, default: {} },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔐 Hash password before saving
authUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hashed = await bcrypt.hash(this.password, 12);
    this.password = hashed;

    this.passwordHistory = this.passwordHistory || [];
    this.passwordHistory.push({ password: hashed });

    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Compare password
authUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔄 Change password with history check
authUserSchema.methods.changePassword = async function (
  currentPassword,
  newPassword
) {
  const isMatch = await this.comparePassword(currentPassword);
  if (!isMatch) throw new Error("Current password is incorrect");

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const usedBefore = await Promise.any(
    this.passwordHistory.map((record) =>
      bcrypt.compare(newPassword, record.password)
    )
  ).catch(() => false);

  if (usedBefore) {
    throw new Error("Cannot reuse previous passwords");
  }

  this.password = newPassword;
  await this.save();
};

// 🔒 Login attempt logic
authUserSchema.methods.incrementLoginAttempts = function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  return this.save();
};

authUserSchema.methods.resetLoginAttempts = function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// 🔑 Create password reset token
authUserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// 🧠 Virtual field for lock status
authUserSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

export default mongoose.model("AuthUser", authUserSchema);
