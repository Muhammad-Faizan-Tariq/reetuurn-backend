import Stripe from 'stripe';
import serviceLogger from '../utils/serviceLogger.util.js'; 
// import logger from './logger.js'; 
import config from './index.js';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-04-10',
  maxNetworkRetries: 3,
  timeout: 20000
});

(async () => {
  try {
    await stripe.accounts.retrieve();
    serviceLogger.info('Stripe connection established', { service: 'stripe' });
  } catch (err) {
    serviceLogger.error('Stripe connection failed', { 
      service: 'stripe',
      error: err.message 
    });
    process.exit(1);
  }
})();

export default stripe;