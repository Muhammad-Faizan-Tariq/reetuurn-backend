

import express from "express";
import {
  submitFeedback,
  getMyFeedback,
} from "../controllers/feedback.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/", verifyToken, submitFeedback);
router.get("/my", verifyToken, getMyFeedback);

export default router;