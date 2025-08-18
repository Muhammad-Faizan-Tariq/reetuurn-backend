import express from "express";
import {
  changePassword,
  getSecuritySettings,
  updatePrivacyPreferences,
} from "../controllers/privacy.controller.js";
import {
  changePasswordValidator,
  privacyPreferencesValidator,
  validate,
} from "../validations/password.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";


const router = express.Router();


router.post("/change-password", verifyToken, changePasswordValidator, validate, changePassword);
// router.get("/security-settings", verifyToken, getSecuritySettings);
// router.patch("/privacy-preferences", verifyToken, privacyPreferencesValidator, validate, updatePrivacyPreferences);

export default router;
