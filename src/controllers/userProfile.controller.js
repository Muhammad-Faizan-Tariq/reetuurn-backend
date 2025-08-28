import UserProfile from "../models/userProfile.model.js";
import authUser from "../models/authuser.model.js";
import { successResponse, errorResponse } from "../utils/response.util.js";
import generateOtp from "../utils/generateOtp.util.js";
import sendOtpEmail from "../utils/sendOtpEmail.util.js";
import { findUserByEmailOrUsername, createUser } from "../services/auth.service.js";

export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      firstName,
      lastName,
      zipCode,
      streetAddress,
      buildingDetails,
      state,        
      city,       
      phoneNumber,
      dob,
      gender,
      location,
      noMarketingMessages = false,
      shareWithPartners = true,
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, "Name, email, and password are required");
    }

    if (!firstName || !lastName || !phoneNumber || !gender) {
      return errorResponse(res, 400, "First name, last name, phone number, and gender are required");
    }

    if (!streetAddress || !buildingDetails || !location?.lat || !location?.lng) {
      return errorResponse(res, 400, "Complete address (street, building, lat, lng) is required");
    }

    if (!dob?.year || !dob?.month || !dob?.day) {
      return errorResponse(res, 400, "Date of birth (year, month, day) is required");
    }


    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return errorResponse(res, 400, "Phone number must be valid international format, e.g. +1234567890");
    }

  
    const allowedGenders = ["male", "female", "prefer not to say", "other"];
    if (!allowedGenders.includes(gender)) {
      return errorResponse(res, 400, `Gender must be one of: ${allowedGenders.join(", ")}`);
    }

  
    const formattedDOB = new Date(`${dob.year}-${dob.month}-${dob.day}`);
    if (isNaN(formattedDOB.getTime())) {
      return errorResponse(res, 400, "Invalid date of birth");
    }

    const userExists = await findUserByEmailOrUsername(email);
    if (userExists) {
      return errorResponse(res, 400, "Email already registered");
    }

  
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await createUser({
      name,
      email,
      password,
      isPasswordSet: true,
      otp: { code: otpCode, expiry: otpExpiry },
    });


    const profile = new UserProfile({
      _id: user._id,
      user: user._id,
      firstName,
      lastName,
      phones: [
        {
          number: phoneNumber,
          type: "primary"
        }
      ],
      addresses: [
        {
          streetAddress,
          buildingDetails,
          zipCode,
          state: state || null,
          city: city || null,
          isPrimary: true,
          location: {
            lat: location.lat,
            lng: location.lng,
          },
        }
      ],
      dob: formattedDOB,
      gender,
      preferences: {
        noMarketingMessages,
        shareWithPartners,
      },
    });

    await profile.save();

    user.userId = profile._id;
    await user.save();

    try {
      await sendOtpEmail(email, name, otpCode);
    } catch (emailError) {
      console.warn("Email sending failed:", emailError);
    }

    return successResponse(res, 201, "Customer created. OTP sent to email (also shown here).", {
      userId: user._id,
      otp: otpCode,
    });

  } catch (error) {
    console.error("createCustomer error:", error);
    return errorResponse(res, 500, "Server error", error);
  }
};
