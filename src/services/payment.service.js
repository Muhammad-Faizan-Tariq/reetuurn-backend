import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import config from "../config/index.js";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion,
  maxNetworkRetries: 2,
  timeout: 15000,
});

const paypalClient = new paypal.core.PayPalHttpClient(
  config.paypal.environment === "live"
    ? new paypal.core.LiveEnvironment(
        config.paypal.clientId,
        config.paypal.secret
      )
    : new paypal.core.SandboxEnvironment(
        config.paypal.clientId,
        config.paypal.secret
      )
);

export const processPayment = async (order, paymentMethod) => {
  const amount = order.payment.amount;
  const currency = order.payment.currency;

  try {
    const result = await initializePayment({
      paymentMethod,
      amount,
      currency,
      orderId: order._id,
    });

    return {
      transactionId: result.paymentId,
      status: result.requiresAction ? "requires_action" : "pending",
      paymentData: result,
    };
  } catch (error) {
    console.error(`[Payment Error] Method: ${paymentMethod}`, error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

const initializePayment = async ({
  paymentMethod,
  amount,
  currency,
  orderId,
}) => {
  const amountInCents = Math.round(amount * 100);

  switch (paymentMethod) {
    case "stripe_card":
      return createStripePayment(amountInCents, currency, orderId, ["card"]);
    case "stripe_klarna":
      return createStripePayment(amountInCents, currency, orderId, ["klarna"]);
    case "stripe_google_pay":
      return createStripePayment(amountInCents, currency, orderId, ["card"]);
    case "paypal":
      return createPaypalPayment(amount, currency, orderId);
    default:
      throw new Error("Unsupported payment method");
  }
};

const createStripePayment = async (amount, currency, orderId, methods) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method_types: methods,
    metadata: { orderId: orderId.toString() },
  });

  return {
    paymentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    requiresAction: true,
  };
};

const createPaypalPayment = async (amount, currency, orderId) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2),
        },
        custom_id: orderId,
      },
    ],
  });

  const response = await paypalClient.execute(request);

  return {
    paymentId: response.result.id,
    approvalUrl: response.result.links.find((l) => l.rel === "approve").href,
    requiresAction: true,
  };
};

export const getAvailablePaymentMethods = () => [
  {
    id: "stripe_card",
    name: "Credit/Debit Card",
    provider: "stripe",
    icon: "credit-card",
  },
  { id: "stripe_klarna", name: "Klarna", provider: "stripe", icon: "klarna" },
  {
    id: "stripe_google_pay",
    name: "Google Pay",
    provider: "stripe",
    icon: "google-pay",
  },
  { id: "paypal", name: "PayPal", provider: "paypal", icon: "paypal" },
];
