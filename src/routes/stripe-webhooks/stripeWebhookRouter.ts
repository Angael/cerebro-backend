import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { stripe } from '../../stripe/stripe.js';
import { STRIPE_ENDPOINT_SECRET } from '../../utils/env.js';
import logger from '../../utils/log.js';
import { stripeSubCreated } from './stripeWebhook.js';
import { HttpError } from '../../utils/errors/HttpError.js';

const router = express.Router({ mergeParams: true });

router.use(express.raw({ type: 'application/json' }));

router.post('/', async (req: Request, res) => {
  try {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, STRIPE_ENDPOINT_SECRET);
    } catch (err) {
      logger.error(err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    logger.verbose(`Received event %s`, event.type);

    switch (event.type) {
      case 'customer.subscription.created':
        await stripeSubCreated(event.data.object);
        // const customerSubscriptionCreated = event.data.object;
        break;

      case 'customer.subscription.updated':
        // const customerSubscriptionUpdated = event.data.object;
        break;

      case 'customer.subscription.deleted':
        // const customerSubscriptionDeleted = event.data.object;
        break;

      case 'customer.subscription.paused':
        // const customerSubscriptionPaused = event.data.object;
        break;

      case 'customer.subscription.resumed':
        // const customerSubscriptionResumed = event.data.object;
        break;

      case 'customer.subscription.trial_will_end':
        // const customerSubscriptionTrialWillEnd = event.data.object;
        break;

      case 'invoice.payment_failed':
        // const invoicePaymentFailed = event.data.object;
        break;

      case 'invoice.payment_succeeded':
        // const invoicePaymentSucceeded = event.data.object;
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
        throw new HttpError(500);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  } catch (e) {
    errorResponse(res, e);
  }
});

const stripeWebhookRouter: MyRoute = { path: '/stripe-webhook', router };
export default stripeWebhookRouter;
