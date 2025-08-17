import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      zipCode: String,
      streetAddress: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
      },
      buildingDetails: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
      },
      location: {
        lat: {
          type: String,
          required: true,
        },
        lng: {
          type: String,
          required: true,
        },
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],
    },
    dob: {
      day: { type: String, default: "" },
      month: { type: String, default: "" },
      year: { type: String, default: "" },
    },
    gender: {
      type: String,
      enum: ["male", "female", "prefer not to say"],
      required: true,
    },
    preferences: {
      noMarketingMessages: {
        type: Boolean,
        default: false,
      },
      shareWithPartners: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);
