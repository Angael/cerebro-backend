import { Stripe } from 'stripe';
import { stripe } from '../../stripe/stripe.js';
import { userTypes } from '../../stripe/userTypes.js';
import { prisma } from '../../db/db.js';
import { UserType } from '@prisma/client';
import logger from '../../utils/log.js';
import { userTypeCache } from '../../cache/userCache.js';

const handlePlan = async (lineItem: Stripe.InvoiceLineItem, stripeCustomerId: string) => {
  if (!lineItem.plan || !lineItem.plan.product) {
    throw new Error('lineItem.plan is undefined');
  }

  const productMetadata = await stripe.products.retrieve(lineItem.plan.product.toString());
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
        subEndsAt: new Date(lineItem.period.end * 1000),
      },
    });

    userTypeCache.set(user.uid, userType);
  }
};

export const hookPaymentSucceeded = async (object: Stripe.Invoice) => {
  console.log('stripePaymentSucceeded', object);

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
        await handlePlan(line, customer.toString());
      }
    }
  }
};
