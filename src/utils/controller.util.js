export const formatOrderResponse = (result) => ({
  order: {
    id: result.order._id,
    orderNumber: result.order.metadata.orderNumber,
    status: result.order.status,
    pickupDate: result.order.schedule.date,
    pickupWindow: `${result.order.schedule.timeWindow.start}-${result.order.schedule.timeWindow.end}`,
    total: result.order.payment.amount,
    currency: result.order.payment.currency,
    pickupPIN: result.order.metadata.pickupPIN,
  },
  payment: result.payment,
});

export const handleControllerError = (res, error) => {
  console.error("[Controller Error]", error);
  const status = error.message.includes("validation")
    ? 400
    : error.message.includes("payment")
    ? 402
    : 500;
  res.status(status).json({
    success: false,
    message: error.message,
  });
};
