import { body, validationResult } from "express-validator";

export const validateReturnOrder = [

  body("pickupAddress.building")
    .notEmpty()
    .withMessage("Building is required")
    .trim(),

  body("pickupAddress.directions")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Directions cannot exceed 100 characters")
    .trim(),

  body("pickupAddress.contactPhone")
    .optional()
    .matches(/^\+?[\d\s-]{6,20}$/)
    .withMessage("Invalid phone number format"),

  body("packages")
    .isArray({ min: 1, max: 10 })
    .withMessage("1–10 packages required"),

  body("packages.*.size")
    .isIn(["small", "medium", "large"])
    .withMessage("Invalid package size"),

  body("packages.*.dimensions")
    .matches(/^\d+x\d+x\d+$/)
    .withMessage("Dimensions must be in WxHxD format (e.g. 15x12x9)"),

  body("packages.*.labelAttached")
    .isBoolean()
    .withMessage("labelAttached must be true/false"),

  body("packages.*.carrier").notEmpty().withMessage("Carrier is required"),

  body("schedule.date")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((date) => new Date(date) >= new Date())
    .withMessage("Pickup date must be today or in the future"),

  body("schedule.timeWindow.start")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:mm)"),

  body("schedule.timeWindow.end")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:mm)")
    .custom((end, { req }) => {
      const start = req.body.schedule.timeWindow.start;
      return end > start;
    })
    .withMessage("End time must be after start time"),

  body("paymentMethod")
    .isIn(["stripe_card", "stripe_klarna", "stripe_google_pay", "paypal"])
    .withMessage("Invalid payment method"),

  body("currency")
    .optional()
    .isIn(["EUR", "USD"])
    .withMessage("Currency must be EUR or USD"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    })),
  });
};
