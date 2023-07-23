import { Stripe } from 'stripe';
import logger from '../../utils/log.js';
import { handlePlan } from './handlePlan.js';

export const hookPaymentSucceeded = async (object: Stripe.Invoice) => {
  const { customer, subscription, lines } = object;

  if (!customer) {
    logger.error('stripePaymentSucceeded: customer not found %s', customer);
    throw new Error('customer not found');
  }

  // if payment for subscription
  if (subscription) {
    // handle all plans
    for (const line of lines.data) {
      if (line.plan) {
        await handlePlan({
          stripeCustomerId: customer.toString(),
          plan: line.plan,
          subEndsAt: new Date(line.period.end * 1000),
        });
      }
    }
  }
};
