import ReturnOrder from "../models/return-order.model.js";
import {processPayment} from "./payment.service.js";
import { validateOrderData } from "../utils/validation.util.js";

export const handleReturnOrder = async (userId, orderData) => {
  validateOrderData(orderData);

  const order = await ReturnOrder.create({
    user: userId,
    ...transformOrderData(orderData),
    status: "pending",
  });

  const payment = await processPayment(order, orderData.paymentMethod);

  order.payment = { ...order.payment, ...payment };
  await order.save();

  return { order, payment };
};

export const getPaymentOptions = () => [
  { id: "stripe_card", name: "Card", provider: "stripe" },
  { id: "paypal", name: "PayPal", provider: "paypal" },
];

export const updateOrderStatus = async (orderId, status) => {
  return await ReturnOrder.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};

const transformOrderData = (data) => ({
  pickupAddress: data.pickupAddress,
  packages: data.packages,
  schedule: {
    date: new Date(data.schedule.date),
    timeWindow: {
      start: data.schedule.startTime,
      end: data.schedule.endTime,
    },
  },
  payment: {
    method: data.paymentMethod.split("_")[0],
    type: data.paymentMethod,
    currency: data.currency || "EUR",
  },
});
