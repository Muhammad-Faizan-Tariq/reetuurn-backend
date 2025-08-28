import AuthUser from "../models/authuser.model.js";
import UserProfile from "../models/userProfile.model.js";
import bcrypt from "bcrypt";

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // console.log(" User ID:", req.user._id);
    // console.log(" Current pass input:", currentPassword);
    // console.log(" New pass input:", newPassword);

    const user = await AuthUser.findById(req.user._id).select("+password +passwordHistory");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // console.log(" User found:", user.email);
    // console.log(" Stored hash:", user.password);


    const directMatch = await bcrypt.compare(currentPassword, user.password);
    // console.log(" Direct bcrypt match:", directMatch);

    if (!directMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }


    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }


    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const record of user.passwordHistory) {
        const isUsed = await bcrypt.compare(newPassword, record.password);
        if (isUsed) {
          return res.status(400).json({
            success: false,
            message: "Cannot reuse previous passwords",
          });
        }
      }
    }


    // console.log("💾 Before save - New password:", newPassword);
    user.password = newPassword;
    
    try {
      await user.save();
      console.log("Save successful");
      
      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (saveError) {
      console.error(" Save error:", saveError);
      console.error(" Save error message:", saveError.message);
      console.error(" Save error stack:", saveError.stack);
      
      res.status(500).json({
        success: false,
        message: "Error saving new password: " + saveError.message,
      });
    }

  } catch (error) {
    console.error(" Error in changePassword:", error);
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