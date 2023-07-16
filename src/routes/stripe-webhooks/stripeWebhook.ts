import Stripe from 'stripe';
import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';

export const stripeSubCreated = async (sub: Stripe.Subscription) => {
  console.log('stripeSubCreated', sub);
  const subUntil = new Date(sub.current_period_end * 1000);
  const uid = sub.metadata.uid;

  // TODO: METADATA not coming with subscription created hook
  if (!uid) {
    logger.error('stripeSubCreated: Uid not found %s', uid);
    throw new Error('uid not found');
  }

  prisma.user.update({
    where: { uid },
    data: {
      stripeCustomerId: sub.customer.toString(),
      subEndsAt: subUntil,
    },
  });
};
