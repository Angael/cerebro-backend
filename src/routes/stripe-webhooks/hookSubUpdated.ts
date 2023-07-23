import { Stripe } from 'stripe';
import { handlePlan } from './handlePlan.js';
import logger from '../../utils/log.js';

export const hookSubUpdated = async (object: Stripe.Subscription) => {
  // Sub is cancelled
  if (object.status === 'canceled') {
    // nothing to do
    logger.verbose('Sub cancelled %s', object.id);
  }

  // Sub is activated
  if (object.status === 'active') {
    for (const line of object.items.data) {
      if (line.plan) {
        await handlePlan({
          stripeCustomerId: object.customer.toString(),
          plan: line.plan,
          subEndsAt: new Date(object.current_period_end * 1000),
        });
      }
    }
    logger.verbose('Sub activated %s', object.id);
  }
};
