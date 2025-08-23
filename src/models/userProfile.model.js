import mongoose from "mongoose";

const phoneSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
    },
    type: {
      type: String,
      enum: ["primary", "secondary", "work", "other"],
      default: "primary",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
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
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "Germany",
    },
    location: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
  },
  { _id: false }
);

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phones: [phoneSchema],
    addresses: [addressSchema],
    dob: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "prefer not to say", "other"],
      required: true,
    },
  },
  { timestamps: true }
);

userProfileSchema.pre("save", function (next) {
  if (
    this.phones.length > 0 &&
    !this.phones.some((p) => p.type === "primary")
  ) {
    this.phones[0].type = "primary";
  }
  next();
});


export default mongoose.model("UserProfile", userProfileSchema);
