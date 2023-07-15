import { STRIPE_KEY } from '../utils/env.js';
import Stripe from 'stripe';

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2022-11-15',
});
