import express from "express";
import {
  trackOrder,
  getUserTracking,
  updateStatus,
  cancelPickup
} from "../controllers/tracking.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getUserTracking);
router.get("/:orderNumber", verifyToken, trackOrder);
router.patch("/:orderNumber/status", verifyToken, updateStatus);
router.patch("/:orderNumber/cancel", verifyToken, cancelPickup);

export default router;
