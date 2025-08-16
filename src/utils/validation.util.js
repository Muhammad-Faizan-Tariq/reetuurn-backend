export const validateOrderData = (data) => {
  const required = ["pickupAddress", "packages", "schedule", "paymentMethod"];
  const missing = required.filter((field) => !data[field]);

  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  if (!["stripe_card", "paypal"].includes(data.paymentMethod)) {
    throw new Error("Unsupported payment method");
  }
};
