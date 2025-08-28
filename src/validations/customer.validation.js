import { check, validationResult } from "express-validator";


export const phoneArrayValidation = [
  check("phones")
    .isArray({ min: 1 })
    .withMessage("Phones must be an array"),
  check("phones.*.number")
    .matches(/^(\+?\d{7,15})$/)
    .withMessage("Invalid phone number"),
  check("phones.*.type")
    .optional()
    .isIn(["primary", "secondary", "work", "other"])
    .withMessage("Invalid phone type"),
];


export const singlePhoneValidation = [
  check("number")
    .matches(/^(\+?\d{7,15})$/)
    .withMessage("Invalid phone number"),
  check("type")
    .optional()
    .isIn(["primary", "secondary", "work", "other"])
    .withMessage("Invalid phone type"),
];



export const addressArrayValidation = [
  check("addresses")
    .isArray({ min: 1 })
    .withMessage("Addresses must be an array"),
  check("addresses.*.streetAddress")
    .notEmpty()
    .withMessage("Street address required"),
  check("addresses.*.buildingDetails")
    .notEmpty()
    .withMessage("Building details required"),
  check("addresses.*.city").notEmpty().withMessage("City required"),
  check("addresses.*.zipCode").notEmpty().withMessage("Zip code required"),
  check("addresses.*.label")
    .optional()
    .isIn(["home", "work", "other"])
    .withMessage("Invalid address label"),
];


export const singleAddressValidation = [
  check("streetAddress").notEmpty().withMessage("Street address required"),
  check("buildingDetails").notEmpty().withMessage("Building details required"),
  check("city").notEmpty().withMessage("City required"),
  check("zipCode").notEmpty().withMessage("Zip code required"),
  check("label")
    .optional()
    .isIn(["home", "work", "other"])
    .withMessage("Invalid address label"),
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
