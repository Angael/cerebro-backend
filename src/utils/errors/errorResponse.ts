import { Response } from 'express';
import { HttpError } from './HttpError.js';
import logger from '../log.js';
import { ZodError } from 'zod';

export const errorResponse = (res: Response, e: Error) => {
  if (e instanceof HttpError) {
    res.sendStatus(e.status);
  } else if (e instanceof ZodError) {
    logger.error('Error: %O', e.issues);
    res.status(400).json(e.issues);
  } else {
    logger.error('Error: %O', e);
    res.sendStatus(500);
  }
};
