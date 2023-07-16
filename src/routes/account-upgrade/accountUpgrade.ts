import { stripe } from '../../stripe/stripe.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import { prisma } from '../../db/db.js';

export const getProducts = async () => {
  const stripeProductsQuery = await stripe.products.list();

  const products = stripeProductsQuery.data.map((product) => {
    return {
      id: product.id,
      object: product.object,
      active: product.active,
      name: product.name,
      description: product.description,
      default_price: product.default_price,
      metadata: product.metadata,
    };
  });

  return products;
};

const getOrCreateStripeCustomer = async (uid) => {
  const user = await prisma.user.findUnique({ where: { uid } });
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      metadata: { uid },
    });
    await prisma.user.update({
      where: { uid },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }
};

const userHasActiveSubscription = async (uid) => {
  const user = await prisma.user.findUnique({ where: { uid } });
  if (user?.subEndsAt) {
    return user.subEndsAt > new Date();
  } else {
    return false;
  }
};

export const generateCheckout = async ({ uid, productId }) => {
  console.log('generateCheckout');

  const stripeCustomerId = await getOrCreateStripeCustomer(uid);

  if (await userHasActiveSubscription(uid)) {
    throw new HttpError(400);
  }

  const product = await stripe.products.retrieve(productId);

  if (product.default_price) {
    const session = await stripe.checkout.sessions.create({
      success_url: 'https://example.com/success',
      // TODO verify toString() is correct
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

stripe.customers.create({});
