import AuthUser from "../models/authuser.model.js";
import hashPassword from "../utils/hashPassword.util.js";
import generateOtp from "../utils/generateOtp.util.js";
import sendOtpEmail from "../utils/sendOtpEmail.util.js";
import { clearCookies, setCookies } from "../utils/setCookie.util.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.util.js";
import verifyOtpUtil from "../utils/verifyOtp.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";


import {
  updateUserOtp,
  verifyAndUpdateUser,
  updateUserPassword
} from "../services/auth.service.js";



// 2. Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const isOtpValid = verifyOtpUtil(user.otp, otp);
    if (!isOtpValid) {
      return errorResponse(res, 400, "Invalid or expired OTP");
    }

  
    await verifyAndUpdateUser(user);

    return successResponse(res, 200, "Account verified successfully");
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};


// 3. Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await updateUserOtp(user, otpCode, otpExpiry);
    await sendOtpEmail(email, user.name, otpCode);

    return successResponse(
      res,
      200,
      "OTP resent successfully. Check your email.",
      { otp: otpCode }
     );
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};

// 4. Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user || !user.isVerified) {
      return errorResponse(res, 401, "Invalid credentials or account not verified");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, "Incorrect password");
    }

    const payload = { userId: user._id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    setCookies(res, accessToken, refreshToken);

    return successResponse(res, 200, "Login successful", {
      user: {
        name: user.name,
        email: user.email
      },
      // token
      accessToken,
      refreshToken
    });
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};

// 5. Logout User
export const logoutUser = async (req, res) => {
  try {
    clearCookies(res);
    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};


// 6. Forget Password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = { code: otpCode, expiry: otpExpiry };
    await user.save();

    await sendOtpEmail(email, user.name, otpCode);

    return successResponse(
      res,
      200,
      "OTP sent to email for password reset. Check your inbox.",
      { otp: otpCode }
    );
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};

// 7. Verify Reset OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const isOtpValid = verifyOtpUtil(user.otp, otp);
    if (!isOtpValid) {
      return errorResponse(res, 400, "Invalid or expired OTP");
    }

    return successResponse(res, 200, "OTP verified for password reset");
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};


// 8. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // const hashedPassword = await hashPassword(newPassword);

    // ✅ Update password and set flag
    await updateUserPassword(user, newPassword);

    return successResponse(res, 200, "Password reset successfully");
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};

