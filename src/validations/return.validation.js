import { validationResult, body } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: extractedErrors,
  });
};



export const validateReturnOrder = [
  body("pickupAddress.building")
    .notEmpty()
    .withMessage("Building is required")
    .trim(),

  body("pickupAddress.directions")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Directions max 100 chars"),

  body("packages")
    .isArray({ min: 1, max: 10 })
    .withMessage("1-10 packages required"),

  body("packages.*.size")
    .isIn(["small", "medium", "large"])
    .withMessage("Invalid size"),

  body("packages.*.dimensions")
    .matches(/^\d+x\d+x\d+$/)
    .withMessage("Invalid dimensions format"),

  body("schedule.date")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((date) => new Date(date) >= new Date())
    .withMessage("Future date required"),

  body("schedule.startTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format"),

  body("schedule.endTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format")
    .custom((end, { req }) => {
      const start = req.body.schedule.startTime;
      return end > start;
    })
    .withMessage("End time must be after start time"),

  body("paymentMethod")
    .isIn(["stripe_card", "stripe_klarna", "stripe_google_pay", "paypal"])
    .withMessage("Invalid payment method"),
];