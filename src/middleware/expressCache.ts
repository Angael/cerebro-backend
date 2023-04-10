import { RequestHandler } from 'express';

type useCacheMiddleware = (duration?: number) => RequestHandler;

export const useCache: useCacheMiddleware =
  (duration = 30) =>
  (req, res, next) => {
    res.set('Cache-control', `public, max-age=${duration}`);
    next();
  };
