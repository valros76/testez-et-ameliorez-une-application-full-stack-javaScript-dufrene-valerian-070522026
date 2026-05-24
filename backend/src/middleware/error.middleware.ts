import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[ERROR] ${req.method} ${req.path} ->`, err);

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};