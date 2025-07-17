import UserProfile from "../models/userProfile.model.js";
import { successResponse, errorResponse } from "../utils/response.util.js";
import generateOtp from "../utils/generateOtp.util.js";
import sendOtpEmail from "../utils/sendOtpEmail.util.js";

import {
  findUserByEmailOrUsername,
  createUser,
} from "../services/auth.service.js";


// register
// 1. Register User
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await findUserByEmailOrUsername(email, username);
    if (userExists) {
      return errorResponse(res, 400, "Email or username already registered");
    }


    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await createUser({
      name,
      username,
      email,
      password,
      isPasswordSet: true,
      otp: { code: otpCode, expiry: otpExpiry }
    });

    await sendOtpEmail(email, name, otpCode);

    return successResponse(res, 201, "User registered. OTP sent to your email.");
  } catch (error) {
    return errorResponse(res, 500, "Server error", error);
  }
};


export const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      firstName,
      lastName,
      zipCode,
      streetAddress,
      buildingDetails,
      phoneNumber,
      dob,
      gender,
      noMarketingMessages = false,
      shareWithPartners = false
    } = req.body;

   
    let formattedDOB = null;
    if (dob?.year && dob?.month && dob?.day) {
      formattedDOB = new Date(`${dob.year}-${dob.month}-${dob.day}`);
    }

    const profileData = {
      user: userId,
      firstName,
      lastName,
      address: {
        zipCode,
        streetAddress,
        buildingDetails
      },
      phoneNumber,
      dob: formattedDOB,
      gender,
      preferences: {
        noMarketingMessages,
        shareWithPartners
      }
    };
    
    const profileId = req.user.userId;
    const profile = await UserProfile.findOneAndUpdate(
      { _id: profileId },
      profileData,
      { new: true, upsert: true }
    );

    return successResponse(res, 200, "Profile updated", profile);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Something went wrong", error);
  }
};
