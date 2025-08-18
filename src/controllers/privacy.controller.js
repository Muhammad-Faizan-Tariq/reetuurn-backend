import AuthUser from "../models/authuser.model.js";
import UserProfile from "../models/userProfile.model.js";

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await AuthUser.findById(req.user._id).select("+password");


    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSecuritySettings = async (req, res) => {
  try {
    const user = await AuthUser.findById(req.user._id).select(
      "email isVerified lastLogin"
    );

    res.json({
      success: true,
      data: {
        email: user.email,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        twoFactorEnabled: false, 
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePrivacyPreferences = async (req, res) => {
  try {
    const { shareData, marketingEmails } = req.body;
    await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        "preferences.shareWithPartners": shareData,
        "preferences.noMarketingMessages": !marketingEmails,
      }
    );

    res.json({
      success: true,
      message: "Privacy preferences updated",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
