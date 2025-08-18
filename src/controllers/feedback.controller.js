import {
  createFeedback,
  getUserFeedback,
} from "../services/feedback.service.js";
import {
  createFeedbackValidator,
  validate,
} from "../validations/feedback.validation.js";

export const submitFeedback = [
  ...createFeedbackValidator,
  validate,
  async (req, res) => {
    try {
      const feedback = await createFeedback(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: "Thank you for your feedback!",
        data: {
          message: feedback.message,
          contactForFollowup: feedback.contactForFollowup,
          participateInResearch: feedback.participateInResearch,
          submittedAt: feedback.createdAt,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
];

export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await getUserFeedback(req.user._id);
    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
