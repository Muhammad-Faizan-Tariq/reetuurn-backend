import { check, body } from "express-validator";
import AuthUser from "../models/authuser.model.js";

export const changePasswordValidator = [

  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom(async (value, { req }) => {
      const user = await AuthUser.findById(req.user._id).select("+password");
      if (!user) {
        throw new Error("User not found");
      }
      const isMatch = await user.comparePassword(value);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
      return true;
    }),


  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character")
    .custom(async (value, { req }) => {

      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }

   
      const user = await AuthUser.findById(req.user._id).select(
        "+passwordHistory"
      );
      if (user.passwordHistory) {
        const isUsed = user.passwordHistory.some((record) =>
          bcrypt.compareSync(value, record.password)
        );
        if (isUsed) {
          throw new Error("Cannot reuse previous passwords");
        }
      }
      return true;
    }),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export const privacyPreferencesValidator = [
  check("shareData").isBoolean().withMessage("Share data must be boolean"),

  check("marketingEmails")
    .isBoolean()
    .withMessage("Marketing emails must be boolean"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
