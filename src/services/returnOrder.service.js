import ReturnOrder from "../models/return-order.model.js";
import { processPayment } from "./payment.service.js";
import { validateOrderData } from "../utils/validation.util.js";

export const handleReturnOrder = async (user, orderData) => {
  validateOrderData(orderData);

  let order;
  let retries = 3;

  while (retries > 0) {
    try {
      order = await ReturnOrder.create({
        user: user,
        ...transformOrderData(orderData),
        status: "pending",
      });
      break;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.["metadata.orderNumber"]) {
        retries--;
        if (retries === 0)
          throw new Error("Failed to generate unique order number");
      } else {
        throw error;
      }
    }
  }

  const payment = await processPayment(order, orderData.paymentMethod);

if (!order.payment) order.payment = {};
order.payment.method =
  payment.method || orderData.paymentMethod?.split("_")[0] || "unknown";
order.payment.type = payment.type || orderData.paymentMethod;
order.payment.currency = payment.currency || orderData.currency || "EUR";
order.payment.status = payment.status || "pending";


  await order.save();

  return { order, payment };
};

export const getPaymentOptions = () => [
  { id: "stripe_card", name: "Card", provider: "stripe" },
  { id: "paypal", name: "PayPal", provider: "paypal" },
];

export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await ReturnOrder.findById(orderId);
  if (!order) throw new Error("Order not found");

  const allowedTransitions = {
    draft: ["pending", "cancelled"],
    pending: ["scheduled", "cancelled"],
    scheduled: ["picked_up", "cancelled"],
    picked_up: [],
    cancelled: [],
  };

  const currentStatus = order.status;
  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: cannot change from ${currentStatus} to ${newStatus}`
    );
  }

  order.status = newStatus;
  await order.save();

  return order;
};

export const transformOrderData = (data) => ({
  pickupAddress: data.pickupAddress,
  packages: data.packages.map((pkg) => ({
    size: pkg.size,
    dimensions: pkg.dimensions,
    labelAttached: pkg.labelAttached,
    carrier: pkg.carrier,
  })),
  schedule: {
    date: new Date(data.schedule.date),
    timeWindow: {
      start: data.schedule.timeWindow.start,
      end: data.schedule.timeWindow.end,
    },
  },
  payment: {
    method: data.paymentMethod.split("_")[0],
    type: data.paymentMethod,
    currency: data.currency || "EUR",
  },
});
