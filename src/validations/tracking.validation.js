
import { check, validationResult } from "express-validator";

export const trackOrderValidator = [
  check("orderNumber")
    .notEmpty()
    .withMessage("Order number is required")
    .isString()
    .withMessage("Order number must be a string")
    .trim(),

  check("trackingNumber")
    .optional()
    .isString()
    .withMessage("Tracking number must be a string")
    .trim(),
];

export const updateStatusValidator = [
  check("orderNumber")
    .notEmpty()
    .withMessage("Order number is required")
    .isString()
    .withMessage("Order number must be a string")
    .trim(),

  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["planned", "picked_up", "returned", "cancelled"])
    .withMessage("Invalid status value"),

  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .toDate(),

  check("timeWindow.start")
    .if(check("status").equals("planned"))
    .notEmpty()
    .withMessage("Start time is required for planned status")
    .isString()
    .withMessage("Start time must be a string")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),

  check("timeWindow.end")
    .if(check("status").equals("planned"))
    .notEmpty()
    .withMessage("End time is required for planned status")
    .isString()
    .withMessage("End time must be a string")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),

  check("notes")
    .if(check("status").equals("cancelled"))
    .notEmpty()
    .withMessage("Cancellation reason is required")
    .isString()
    .withMessage("Notes must be a string")
    .trim(),
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
