import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  generateToken(req: Request, res: Response): string {
    const token = crypto.randomBytes(32).toString('hex');

    res.cookie('x-csrf-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return token;
  }
}
