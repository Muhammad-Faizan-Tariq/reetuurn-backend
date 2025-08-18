import { check, validationResult } from "express-validator";

export const phoneValidation = [
  check("phones").isArray().withMessage("Phones must be an array"),
  check("phones.*.number").isMobilePhone().withMessage("Invalid phone number"),
  check("phones.*.type")
    .isIn(["primary", "secondary", "work", "other"])
    .withMessage("Invalid phone type"),
];

export const addressValidation = [
  check("addresses").isArray().withMessage("Addresses must be an array"),
  check("addresses.*.streetAddress")
    .notEmpty()
    .withMessage("Street address required"),
  check("addresses.*.buildingDetails")
    .notEmpty()
    .withMessage("Building details required"),
  check("addresses.*.city").notEmpty().withMessage("City required"),
  check("addresses.*.zipCode").notEmpty().withMessage("Zip code required"),
];

export const newAddressValidation = [
  check("streetAddress").notEmpty().withMessage("Street address required"),
  check("buildingDetails").notEmpty().withMessage("Building details required"),
  check("city").notEmpty().withMessage("City required"),
  check("zipCode").notEmpty().withMessage("Zip code required"),
  check("label").optional().isIn(["home", "work", "other"]),
];

export const phoneVerificationValidation = [
  check("phoneNumber").isMobilePhone().withMessage("Invalid phone number"),
  check("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};
