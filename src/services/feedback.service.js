import Feedback from "../models/feedback.model.js";

export const createFeedback = async (
  userId,
  { message, contactForFollowup = false, participateInResearch = false }
) => {
  const feedback = new Feedback({
    user: userId,
    message,
    contactForFollowup,
    participateInResearch,
  });

  await feedback.save();
  return feedback;
};

export const getUserFeedback = async (userId) => {
  return await Feedback.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("message contactForFollowup participateInResearch createdAt");
};
