import AuthUser from "../models/authuser.model.js";


export const findUserByEmailOrUsername = async (email, username) => {
  return await AuthUser.findOne({
    $or: [{ email }, { username }]
  });
};


export const createUser = async (userData) => {
  const user = new AuthUser(userData);
  return await user.save();
};


export const findUserByEmail = async (email) => {
  return await AuthUser.findOne({ email });
};

export const updateUserOtp = async (user, otpCode, otpExpiry) => {
  user.otp = { code: otpCode, expiry: otpExpiry };
  return await user.save();
};


export const verifyAndUpdateUser = async (user) => {
  user.isVerified = true;
  user.otp = { code: null, expiry: null };
  return await user.save();
};


export const updateUserPassword = async (user, hashedPassword) => {
  user.password = hashedPassword;
  user.otp = { code: null, expiry: null };
  user.isPasswordSet = true;
  return await user.save();
};
