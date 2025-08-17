import Stripe from "stripe";
import config from "../config/index.js";
import serviceLogger from "../utils/serviceLogger.util.js";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion,
  maxNetworkRetries: 3,
  timeout: 20000,
});

(async () => {
  try {
    await stripe.accounts.retrieve();
    serviceLogger.info("Stripe connection established", { service: "stripe" });
  } catch (err) {
    serviceLogger.error("Stripe connection failed", {
      service: "stripe",
      error: err.message,
    });
    process.exit(1);
  }
})();

export default stripe;
