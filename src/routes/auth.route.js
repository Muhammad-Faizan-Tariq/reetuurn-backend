import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  forgetPassword,
  verifyResetOtp,
  resetPassword
} from "../controllers/auth.controller.js";

import {
  registerValidator,
  loginValidator,
  otpValidator,
  emailOnlyValidator,
  resetPasswordValidator,
  validate
} from "../middlewares/authValidator.middleware.js";

const router = express.Router();

router.post("/register", registerValidator, validate, registerUser);
router.post("/verify-otp", otpValidator, validate, verifyOtp);
router.post("/resend-otp", emailOnlyValidator, validate, resendOtp);
router.post("/login", loginValidator, validate, loginUser);
router.post("/logout", logoutUser);
router.post("/forget-password", emailOnlyValidator, validate, forgetPassword);
router.post("/verify-reset-otp", otpValidator, validate, verifyResetOtp);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);

export default router;
