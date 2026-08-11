import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpClientError } from '../lib/errors.js';
import { config } from '../config.js';
import logger from '../lib/logger.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  const stackTraceObject = config.isProd ? {} : { stack: error.stack };

  if (error instanceof z.ZodError) {
    logger.info('ZodError', error);
    return res.status(400).json({
      status: 400,
      error: z.prettifyError(error),
      ...stackTraceObject,
    });
  }

  if (error instanceof HttpClientError) {
    logger.info('HttpClientError', error);
    return res.status(error.status).json({
      status: error.status,
      error: error.message,
      ...stackTraceObject,
    });
  }

  logger.error('Internal server error', error);

  res.status(500).json({
    error: 'Internal server error',
    status: 500,
    ...stackTraceObject,
  });
}
