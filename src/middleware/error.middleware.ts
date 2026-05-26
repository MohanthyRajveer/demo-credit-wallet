import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/helpers';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res
    .status(500)
    .json(errorResponse('An unexpected error occurred', err.message));
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res
    .status(404)
    .json(errorResponse(`Route ${req.method} ${req.path} not found`));
};