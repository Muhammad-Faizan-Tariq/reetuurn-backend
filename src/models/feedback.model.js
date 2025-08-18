import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      minlength: [10, "Feedback must be at least 10 characters"],
      maxlength: [500, "Feedback cannot exceed 500 characters"],
    },
    contactForFollowup: {
      type: Boolean,
      default: false,
    },
    participateInResearch: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feedback", feedbackSchema);
