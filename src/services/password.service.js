import AuthUser from "../models/authuser.model.js";
import bcrypt from "bcryptjs";

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    console.log("User ID:", userId);
    
    const user = await AuthUser.findById(userId).select("+password");
    if (!user) {
      throw new Error("User not found");
    }

    console.log("Stored hash:", user.password);
    console.log("Input password:", currentPassword);
    console.log("New password:", newPassword);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("Match result:", isMatch);

    if (!isMatch) {
      const commonIssues = await checkCommonPasswordIssues(user, currentPassword);
      if (commonIssues.isKnownIssue) {
        throw new Error(commonIssues.message);
      }
      throw new Error("Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return { success: true, message: "Password changed successfully" };

  } catch (error) {
    console.error("Password change error:", error.message);
    throw error;
  }
};

const checkCommonPasswordIssues = async (user, attemptedPassword) => {
  if (user.password === attemptedPassword) {
    return {
      isKnownIssue: true,
      message: "Your password was stored incorrectly. Please use the force reset option."
    };
  }

  const commonVariations = [
    attemptedPassword.trim(),
    attemptedPassword.toLowerCase(),
    attemptedPassword.toUpperCase()
  ];

  for (const variation of commonVariations) {
    const isMatch = await bcrypt.compare(variation, user.password);
    if (isMatch) {
      return {
        isKnownIssue: true,
        message: "Password case sensitivity issue detected"
      };
    }
  }

  return { isKnownIssue: false };
};

export const forceResetPassword = async (userId, newPassword) => {
  try {
    const user = await AuthUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return { success: true, message: "Password force reset successfully" };
  } catch (error) {
    throw error;
  }
};