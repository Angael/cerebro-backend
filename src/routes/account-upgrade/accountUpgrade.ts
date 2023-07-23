import { stripe } from '../../stripe/stripe.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';
import { API_URL } from '../../utils/env.js';
import { AccountProduct, AccountStatus } from '@vanih/cerebro-contracts/lib/accountProduct.js';
import { UserType } from '@prisma/client';
import Stripe from 'stripe';

export const getAccountStatus = async (uid: string): Promise<AccountStatus> => {
  const user = await prisma.user.findUnique({ where: { uid } });
  const type = user?.type ?? 'FREE';
  if (!user || !user.stripeCustomerId || !user.subEndsAt) {
    return { type, sub: null };
  }

  const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId });

  const activeSubs = subs.data.filter((sub) => sub.status === 'active');

  // find sub with newest date
  const sub = activeSubs.reduce((prev: Stripe.Subscription | null, current) => {
    return (prev?.current_period_end ?? 0) > current.current_period_end ? prev : current;
  }, null);

  return {
    type,
    sub: sub
      ? {
          endsAt: user.subEndsAt,
          status: sub.status,
          renews: !sub.cancel_at_period_end,
        }
      : null,
  };
};

export const getPremium = async (): Promise<AccountProduct> => {
  const stripeProducts = await stripe.products.list({
    active: true,
  });

  const product = stripeProducts.data.find(
    (product) => product.metadata.userType === UserType.PREMIUM,
  );

  if (!product) {
    throw new HttpError(500);
  }

  const price = await stripe.prices.retrieve(product.default_price as string);

  return {
    id: product.id,
    object: product.object,
    active: product.active,
    name: product.name,
    description: product.description ?? '',
    price: {
      amount: price?.unit_amount ?? 0,
      currency: price?.currency ?? '',
    },
    metadata: product.metadata as any, // Sad pepe noises :(
  };
};

const getOrCreateStripeCustomer = async (uid) => {
  const user = await prisma.user.findUnique({ where: { uid }, select: { stripeCustomerId: true } });
  logger.verbose('user %s', user?.stripeCustomerId);
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      metadata: { uid },
    });
    // Just in case the user didn't have a stripeCustomerId
    await prisma.user.update({
      where: { uid },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }
};

const userHasActiveSubscription = async (stripeCustomerId: string) => {
  const stripeSub = await stripe.subscriptions.list({ customer: stripeCustomerId });
  const activeSub = stripeSub.data.find((sub) => sub.status === 'active');

  return !!activeSub;
};

export const generateCheckout = async ({ uid, productId }) => {
  logger.verbose('generateCheckout for uid %s , productId %s', uid, productId);

  const stripeCustomerId = await getOrCreateStripeCustomer(uid);

  // Dont allow 2 subscriptions in stripe
  if (await userHasActiveSubscription(stripeCustomerId)) {
    throw new HttpError(400);
  }

  const product = await stripe.products.retrieve(productId);

  // Only allow products with a default price, no support for multiple prices per product
  if (product.default_price) {
    const session = await stripe.checkout.sessions.create({
      success_url: API_URL + '/account',
      line_items: [{ price: product.default_price.toString(), quantity: 1 }],
      mode: 'subscription',
      metadata: { uid },
      customer: stripeCustomerId,
    });

    return session.url;
  } else {
    throw new HttpError(400);
  }
};
