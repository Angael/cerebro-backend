import { Response } from 'express';
import { HttpError } from './HttpError.js';
import logger from '../log.js';

export const errorResponse = (res: Response, e: Error) => {
  if (e instanceof HttpError) {
    res.sendStatus(e.status);
  } else {
    logger.error('Error: %O', e);
    res.sendStatus(500);
  }
};
