import Stripe from 'stripe';
import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';

// TODO: This hook is potentially harmful, as subscribtion creation doesnt mean its paid for
export const hookSubCreated = async (sub: Stripe.Subscription) => {
  console.log('stripeSubCreated', sub);
  const subUntil = new Date(sub.current_period_end * 1000);
  const stripCustomerId = sub.customer;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: stripCustomerId.toString() },
    select: { uid: true },
  });

  if (!user) {
    logger.error('stripeSubCreated: user not found stripeCustomerId %s', stripCustomerId);
    throw new Error('user not found');
  }

  prisma.user.update({
    where: { uid: user.uid },
    data: {
      stripeCustomerId: sub.customer.toString(),
      subEndsAt: subUntil,
    },
  });
};
