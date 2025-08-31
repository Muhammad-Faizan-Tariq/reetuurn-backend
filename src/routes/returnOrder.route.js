import express from "express";
import {
  createPaymentIntents,
  confirmPaymentAndCreateOrders,
  listPaymentOptions,
  updateStatus,
  handleStripeWebhook
} from "../controllers/returnOrder.controller.js";
import {
  validatePaymentIntent,
  validateConfirmPayment
} from "../validations/returnOrder.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create payment intent first
router.post(
  "/payment-intent",
  verifyToken,
  validatePaymentIntent,
  createPaymentIntents
);

// Confirm payment and create order
router.post(
  "/confirm-payment",
  verifyToken,
  validateConfirmPayment,
  confirmPaymentAndCreateOrders
);

// Get payment options
router.get("/payment-options", listPaymentOptions);

// Update order status
router.patch("/:orderId/status", verifyToken, updateStatus);

// Stripe webhook (no auth required)
router.post("/webhook", express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
