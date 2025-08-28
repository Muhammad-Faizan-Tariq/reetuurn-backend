import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const otpSchema = new mongoose.Schema({
  code: String,
  expiry: Date,
}, { _id: false });


const authUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [50, "Name must not exceed 50 characters"]
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username must not exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Email is invalid"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  userType: {
    type: String,
    enum: ["customer", "driver"],
  },
  otp: otpSchema,
  isVerified: {
    type: Boolean,
    default: false
  },
  isPasswordSet: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });



authUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


authUserSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model("AuthUser", authUserSchema);
