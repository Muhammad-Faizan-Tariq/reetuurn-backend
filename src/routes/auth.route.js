import express from "express";
import {
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  forgetPassword,
  verifyResetOtp,
  resetPassword
} from "../controllers/auth.controller.js";

import {
  loginValidator,
  otpValidator,
  emailOnlyValidator,
  resetPasswordValidator,
  validate
} from "../validations/auth.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/verify-otp", otpValidator, validate, verifyOtp);
router.post("/resend-otp", emailOnlyValidator, validate, resendOtp);
router.post("/login", loginValidator, validate, loginUser);
router.post("/logout", verifyToken, logoutUser);
router.post("/forget-password", emailOnlyValidator, validate, forgetPassword);
router.post("/verify-reset-otp", otpValidator, validate, verifyResetOtp);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);

export default router;
