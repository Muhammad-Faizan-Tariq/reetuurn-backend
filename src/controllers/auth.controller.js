import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthUser from "../models/authuser.model.js";
import hashPassword from "../utils/hashPassword.util.js";
import generateOtp from "../utils/generateOtp.util.js";
import sendOtpEmail from "../utils/sendOtpEmail.util.js";
import { clearCookies, setCookies } from "../utils/setCookie.util.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.util.js";

// 1. Register User
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await AuthUser.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ message: "Email or username already registered" });
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);


    const user = new AuthUser({
      name,
      username,
      email,
      password: hashedPassword,
      isPasswordSet: true,
      otp: { code: otpCode, expiry: otpExpiry }
    });
    // console.log("Stored OTP:", user.otp.code);
    await user.save();
    await sendOtpEmail(email, name, otpCode);


    res.status(201).json({ message: "User registered. OTP sent to your email." });
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;


    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isOtpValid = user.otp.code === otp && user.otp.expiry > new Date();


    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }


    user.isVerified = true;
    user.otp = { code: null, expiry: null };
    await user.save();



    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error("Error in verifyOtp:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = { code: otpCode, expiry: otpExpiry };
    await user.save();

    await sendOtpEmail(email, user.name, otpCode);
    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    console.error("Error in resendOtp:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(401).json({ message: "Invalid credentials or account not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

  
    const payload = { userId: user._id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    
    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 5. Logout User
export const logoutUser = async (req, res) => {
  try {
    clearCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logoutUser:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 6. Forget Password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = { code: otpCode, expiry: otpExpiry };
    await user.save();
    console.log("Stored OTP for password reset:", user.otp.code);

    await sendOtpEmail(email, user.name, otpCode);
    res.status(200).json({ message: "OTP sent for password reset" });
  } catch (error) {
    console.error("Error in forgetPassword:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 7. Verify Reset OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // const isOtpValid = user.otp.code === otp && user.otp.expiry > new Date();
    const isOtpValid = user.otp.code === otp.toString() && user.otp.expiry > new Date();


    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified for password reset" });
  } catch (error) {
    console.error("Error in verifyResetOtp:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 8. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.otp = { code: null, expiry: null };
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
