import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

const otpSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      minlength: 6,
      maxlength: 6,
      required: false,
    },
    expiry: {
      type: Date,
      default: null, 
      required: false,
    },
    purpose: {
      type: String,
      enum: ["verification", "passwordReset", "phoneVerification"],
      required: false, 
    },
  },
  { _id: false }
);

const passwordHistorySchema = new mongoose.Schema(
  {
    password: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      index: true,
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
    passwordResetToken: String,
    passwordResetExpires: Date,
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


authUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);

    if (this.passwordHistory) {
      this.passwordHistory.push({ password: this.password });
    } else {
      this.passwordHistory = [{ password: this.password }];
    }

    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (err) {
    next(err);
  }
});


authUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


authUserSchema.methods.changePassword = async function (
  currentPassword,
  newPassword
) {
  if (!(await this.comparePassword(currentPassword))) {
    throw new Error("Current password is incorrect");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const isUsedBefore = this.passwordHistory.some((record) =>
    bcrypt.compareSync(newPassword, record.password)
  );
  if (isUsedBefore) {
    throw new Error("Cannot reuse previous passwords");
  }

  this.password = newPassword;
  await this.save();
};


authUserSchema.methods.incrementLoginAttempts = function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000;
  }
  return this.save();
};

authUserSchema.methods.resetLoginAttempts = function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};


authUserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

authUserSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

export default mongoose.model("AuthUser", authUserSchema);
