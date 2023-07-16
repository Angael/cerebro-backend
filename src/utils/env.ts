export const isProd = process.env.NODE_ENV === 'production';
export const STRIPE_KEY = process.env.STRIPE_KEY as string;
export const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET as string;

export const API_URL = process.env.API_URL as string;
