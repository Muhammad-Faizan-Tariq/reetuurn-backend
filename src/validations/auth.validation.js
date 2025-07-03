import { check, validationResult } from "express-validator";


export const registerValidator = [
  check("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be 3–50 characters long"),

  check("username")
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters long"),

  check("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),

  check("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

];


export const loginValidator = [
  check("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),

  check("password")
    .notEmpty().withMessage("Password is required")
];


export const emailOnlyValidator = [
  check("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
];


export const otpValidator = [
  ...emailOnlyValidator,
  check("otp")
    .notEmpty().withMessage("OTP is required")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
];


export const resetPasswordValidator = [
  ...emailOnlyValidator,
  check("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }
  next();
};
