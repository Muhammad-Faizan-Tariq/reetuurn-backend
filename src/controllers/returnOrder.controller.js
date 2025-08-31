import {
  handleReturnOrder,
  getPaymentOptions,
  updateOrderStatus,
  createPaymentIntent,
  confirmPaymentAndCreateOrder,
} from "../services/returnOrder.service.js";
import {
  formatOrderResponse,
  handleControllerError,
} from "../utils/controller.util.js";
import stripe from "../services/stripe.service.js";

import ReturnReceipt from "../models/receipt.model.js";

// Create payment intent first
export const createPaymentIntents = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });
    }

    const { packages, paymentMethod, currency = "EUR" } = req.body;

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one package is required" });
    }

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Payment method is required" });
    }

    const paymentIntent = await createPaymentIntent(packages, paymentMethod, currency);

    res.json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

// Confirm payment and create order
export const confirmPaymentAndCreateOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });
    }

    const { paymentIntentId, orderData } = req.body;

    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ success: false, message: "Payment intent ID is required" });
    }

    if (!orderData) {
      return res
        .status(400)
        .json({ success: false, message: "Order data is required" });
    }

    const result = await confirmPaymentAndCreateOrder(
      req.user._id,
      paymentIntentId,
      orderData
    );

    // Create receipt
    const receipt = await ReturnReceipt.create({
      user: req.user._id,
      returnOrderId: result.order._id,
    });

    res.status(201).json({
      success: true,
      message: "Payment confirmed and return order created successfully",
      data: {
        order: formatOrderResponse(result.order),
        receipt: {
          id: receipt._id,
          generatedAt: receipt.generatedAt,
        },
      },
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const listPaymentOptions = (req, res) => {
  try {
    res.json({ success: true, data: getPaymentOptions() });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const order = await updateOrderStatus(orderId, status);

    res.json({ success: true, data: formatOrderResponse(order) });
  } catch (error) {
    handleControllerError(res, error);
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // You can add additional logic here if needed
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Handle failed payment
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};
