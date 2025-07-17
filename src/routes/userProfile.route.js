import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createOrUpdateProfile, registerUser } from "../controllers/userProfile.controller.js";
import { registerValidator, validate } from "../validations/auth.validation.js";

const router = express.Router();


router.post("/register", registerValidator, validate, registerUser);
router.post("/profile", verifyToken, createOrUpdateProfile);

export default router;
