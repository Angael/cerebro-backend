import { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import logger from '../utils/log.js';

export const forRole =
  (role: keyof typeof UserType) => (req: Request, res: Response, next: NextFunction) => {
    if (req.auth?.userId && req.auth.sessionClaims?.roles?.includes(role)) {
      next();
    } else {
      const { method, url } = req;
      logger.error('Failed role check for %o', {
        method,
        url,
        userId: req.auth?.userId,
        requiredRole: role,
      });
      res.status(403).send();
    }
  };
