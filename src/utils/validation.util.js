export const validateOrderData = (data) => {
  const required = ["pickupAddress", "packages", "schedule", "paymentMethod"];
  const missing = required.filter((field) => !data[field]);

  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  if (
    !["stripe_card", "stripe_klarna", "stripe_google_pay", "paypal"].includes(
      data.paymentMethod
    )
  ) {
    throw new Error("Unsupported payment method");
  }

  if (
    data.payment?.currency &&
    !["USD", "EUR"].includes(data.payment.currency)
  ) {
    throw new Error("Unsupported currency. Allowed: USD, EUR");
  }

  if (data.payment?.amount) {
    throw new Error("Amount is auto-calculated and should not be provided");
  }
};
