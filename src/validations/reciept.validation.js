import { param, validationResult } from "express-validator";

export const receiptIdParamValidator = [
  param("receiptId")
    .notEmpty()
    .withMessage("Receipt ID is required")
    .isMongoId()
    .withMessage("Invalid Receipt ID"),
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
