import { check } from "express-validator";

export const createFeedbackValidator = [
  check("message")
    .notEmpty()
    .withMessage("Feedback message is required")
    .isLength({ min: 10 })
    .withMessage("Feedback must be at least 10 characters")
    .isLength({ max: 500 })
    .withMessage("Feedback cannot exceed 500 characters"),

  check("contactForFollowup")
    .optional()
    .isBoolean()
    .withMessage("Contact preference must be true or false"),

  check("participateInResearch")
    .optional()
    .isBoolean()
    .withMessage("Research participation must be true or false"),
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
