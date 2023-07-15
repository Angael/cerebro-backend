import { stripe } from '../../stripe/stripe.js';

export const getPrices = async () => {
  return stripe.products.list();
};
