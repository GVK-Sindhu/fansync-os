import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export class ApiError extends Error {
  public readonly statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  
  Logger.error('ErrorHandler', `HTTP ${req.method} ${req.path} failed with status ${statusCode}: ${message}`, err);

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
