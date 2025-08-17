// routes/tracking.routes.js
import express from "express";
import {
  trackOrder,
  getUserTracking,
  updateStatus,
} from "../controllers/tracking.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getUserTracking);
router.get("/:orderNumber", verifyToken, trackOrder);
router.patch("/:orderNumber/status", verifyToken, updateStatus);

export default router;
