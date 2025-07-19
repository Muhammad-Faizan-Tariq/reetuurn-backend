import UserProfile from "../models/userProfile.model.js";
import authUser from "../models/authuser.model.js";
import { successResponse, errorResponse } from "../utils/response.util.js";
import generateOtp from "../utils/generateOtp.util.js";
import sendOtpEmail from "../utils/sendOtpEmail.util.js";
import { findUserByEmailOrUsername, createUser } from "../services/auth.service.js";

export const createCustomer = async (req, res) => {
  try {
    // Destructure request body
    const {
      name,
      username,
      email,
      password,
      firstName,
      lastName,
      zipCode,
      streetAddress,
      buildingDetails,
      phoneNumber,
      dob,
      gender,
      location,
      noMarketingMessages = false,
      shareWithPartners = true,
    } = req.body;

    // --- VALIDATIONS ---

    // Required top-level fields
    if (!name || !username || !email || !password) {
      return errorResponse(res, 400, "Name, username, email, and password are required");
    }

    // Required profile info
    if (!firstName || !lastName || !phoneNumber || !gender) {
      return errorResponse(res, 400, "First name, last name, phone number, and gender are required");
    }

    // Required address fields
    if (!streetAddress || !buildingDetails || !location?.lat || !location?.lng) {
      return errorResponse(res, 400, "Complete address (street, building, lat, lng) is required");
    }

    // Required date of birth fields
    if (!dob?.year || !dob?.month || !dob?.day) {
      return errorResponse(res, 400, "Date of birth (year, month, day) is required");
    }

    // Validate phone number (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return errorResponse(res, 400, "Phone number must be valid international format, e.g. +1234567890");
    }

    // Validate gender enum
    const allowedGenders = ["male", "female", "prefer not to say"];
    if (!allowedGenders.includes(gender)) {
      return errorResponse(res, 400, `Gender must be one of: ${allowedGenders.join(", ")}`);
    }

    // Format and validate DOB
    const formattedDOB = new Date(`${dob.year}-${dob.month}-${dob.day}`);
    if (isNaN(formattedDOB.getTime())) {
      return errorResponse(res, 400, "Invalid date of birth");
    }

    // --- CHECK USER EXISTENCE ---
    const userExists = await findUserByEmailOrUsername(email, username);
    if (userExists) {
      return errorResponse(res, 400, "Email or username already registered");
    }

    // --- CREATE OTP ---
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // --- CREATE AUTH USER ---
    const user = await createUser({
      name,
      username,
      email,
      password,
      isPasswordSet: true,
      otp: { code: otpCode, expiry: otpExpiry }
    });

    // --- CREATE USER PROFILE ---
    const profile = new UserProfile({
      _id: user._id, // Sync IDs for user and profile
      user: user._id,
      firstName,
      lastName,
      address: {
        zipCode,
        streetAddress,
        buildingDetails,
        location: {
          lat: location.lat,
          lng: location.lng,
        }
      },
      phoneNumber,
      dob: formattedDOB,
      gender,
      preferences: {
        noMarketingMessages,
        shareWithPartners,
      },
    });

    await profile.save();

    // Link profile ID back to authUser
    user.userId = profile._id;
    await user.save();

    // --- SEND OTP EMAIL ---
    try {
      await sendOtpEmail(email, name, otpCode);
    } catch (emailError) {
      console.warn("Email sending failed:", emailError);
      // Don't fail the entire request if email fails
    }

    // --- SUCCESS RESPONSE ---
    return successResponse(res, 201, "Customer created. OTP sent to email (also shown here).", {
      userId: user._id,
      otp: otpCode,
    });

  } catch (error) {
    console.error("createCustomer error:", error);
    return errorResponse(res, 500, "Server error", error);
  }
};
