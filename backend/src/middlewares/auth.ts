import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  creator?: {
    id: string;
    email: string;
    name: string;
  };
}

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Local developer fallback to prevent breaking existing prototype routes
    if (process.env.NODE_ENV !== 'production') {
      // Auto-inject default seed creator
      req.creator = {
        id: (req.query.creatorId as string) || (req.body.creatorId as string) || 'e2b2f518-7fba-4a57-b087-9bc401b3d0e2',
        email: 'alex@fansvine.com',
        name: 'Alex Vance',
      };
      return next();
    }
    return next(new ApiError(401, 'Access denied. No authentication token provided.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'fantwin-jwt-secret-key-12345';
    const decoded = jwt.verify(token, secret) as any;
    req.creator = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid authentication token.'));
  }
};
