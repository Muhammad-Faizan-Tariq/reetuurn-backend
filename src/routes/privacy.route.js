import express from "express";
import {
  changePassword,
  // getSecuritySettings,
  // updatePrivacyPreferences
} from "../controllers/privacy.controller.js";
import {
  changePasswordValidator,
  validate,
} from "../validations/password.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
// import AuthUser from "../models/authuser.model.js";
const router = express.Router();

router.patch("/change-password", verifyToken, changePasswordValidator, validate, changePassword);
// router.get("/security-settings", verifyToken, getSecuritySettings);
// router.patch("/privacy-preferences", verifyToken, updatePrivacyPreferences);


//force reset for debugging
// router.post("/force-password-reset", async (req, res) => {
//   try {
//     const { userId, newCurrentPassword } = req.body;
    
//     const user = await AuthUser.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
    
//     // Direct password set (auto-hash hojayega)
//     user.password = newCurrentPassword;
//     await user.save();
    
//     res.json({ 
//       success: true,
//       message: "Password force reset. Now use this as current password: " + newCurrentPassword
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;