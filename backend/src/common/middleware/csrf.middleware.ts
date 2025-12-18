import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.CSRF_SECRET || 'super-secret-csrf-key-change-in-production';
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for public endpoints and GET requests
    const publicPaths = [
      '/api/health',
      '/api/docs',
      '/api/track',
      '/api/auth/login',
      '/api/auth/signup',
      '/api/auth/verify-otp',
      '/api/auth/resend-otp',
      '/api/csrf/token',
    ];

    const isPublicPath = publicPaths.some((path) => req.path.startsWith(path));
    const isGetRequest = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);

    if (isPublicPath || isGetRequest) {
      return next();
    }

    // Verify CSRF token for state-changing requests
    const token = req.headers['x-csrf-token'] as string;
    const cookieToken = req.cookies['x-csrf-token'];

    if (!token || !cookieToken || token !== cookieToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    next();
  }

  generateToken(req: Request, res: Response): string {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set cookie with the token
    res.cookie('x-csrf-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return token;
  }
}
