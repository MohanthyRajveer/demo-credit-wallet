import { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { User } from '../types';
import { errorResponse } from '../utils/helpers';

// This adds the 'user' property to every Express request
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = (db: Knex) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(
          errorResponse(
            'Authentication required. Provide: Authorization: Bearer <userId>'
          )
        );
        return;
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json(errorResponse('Invalid token'));
        return;
      }

      // Look up the user by their ID (the faux token)
      const user = await db<User>('users').where({ id: token }).first();

      if (!user) {
        res
          .status(401)
          .json(errorResponse('User not found or token invalid'));
        return;
      }

      // Attach user to the request so controllers can use it
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json(errorResponse('Authentication error'));
    }
  };
};