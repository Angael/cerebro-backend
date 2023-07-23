import { Stripe } from 'stripe';
import { stripe } from '../../stripe/stripe.js';
import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';
import { userTypes } from '../../stripe/userTypes.js';
import { UserType } from '@prisma/client';
import { userTypeCache } from '../../cache/userCache.js';

type Params = {
  stripeCustomerId: string;
  plan: Stripe.Plan;
  subEndsAt: Date;
};

export const handlePlan = async ({ stripeCustomerId, plan, subEndsAt }: Params) => {
  if (!plan || !plan.product) {
    throw new Error('lineItem.plan is undefined');
  }

  const productMetadata = await stripe.products.retrieve(plan.product.toString());
  const userType = productMetadata.metadata.userType;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: stripeCustomerId },
    select: { uid: true },
  });

  if (!user) {
    logger.error('stripePaymentSucceeded: user not found stripeCustomerId %s', stripeCustomerId);
    throw new Error('user not found');
  }

  if (Object.keys(userTypes).includes(userType)) {
    await prisma.user.update({
      where: { uid: user.uid },
      data: {
        type: userType as UserType,
        subEndsAt, //new Date(lineItem.period.end * 1000),
      },
    });

    userTypeCache.set(user.uid, userType);
  }
};
