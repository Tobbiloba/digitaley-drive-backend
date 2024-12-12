import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/ErrorHandler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redis } from '../utils/redis';
import CatchAsyncError from './catchAsynchError';
import { updateAccessToken } from '../controller/user.controller';

export const getToken = (token: string) => {
  if (token.startsWith('Bearer')) return token.split(' ')[1];
  return token;
};

// authenticated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader =
      req.headers['authorization'] || (req.headers['x-access-token'] as string);

    // console.log(req.headers, authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new ErrorHandler('Please login to access this resource', 401),
      );
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1]; // Get the token part after "Bearer"

    // Validate and process the token
    const accessToken = getToken(token);
    console.log("Token", accessToken); // Debugging purposes

    if (!accessToken) {
      return next(new ErrorHandler('Invalid token. Please login again.', 401));
    }

    const decoded = jwt.decode(accessToken) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler('access token is not valid', 400));
    }

    // check if the access token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      try {
        await updateAccessToken(req, res, next);
      } catch (error) {
        return next(error);
      }
    } else {
      const user = await redis.get(decoded.id);

      if (!user) {
        return next(
          new ErrorHandler('Please login to access this resource', 400),
        );
      }

      req.user = JSON.parse(user);
      // console.log(user)
      next();
    }
  },
);

export const hasRefreshToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['x-refresh-token']) {
      return next(
        new ErrorHandler('Please login to access this resource', 400),
      );
    }
    const refreshToken = getToken(req.headers['x-refresh-token'] as string);

    if (!refreshToken) {
      return next(
        new ErrorHandler('Please login to access this resource', 400),
      );
    }

    const decoded = jwt.decode(refreshToken) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler('refresh token is not valid', 400));
    }
    // check if the access token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      return next(new ErrorHandler('refresh token is expired', 400));
    } else {
      const user = await redis.get(decoded.id);

      if (!user) {
        return next(
          new ErrorHandler('Please login to access this resource', 400),
        );
      }

      req.user = JSON.parse(user);
      console.log({user})
      next();
    }
  },
);

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};
