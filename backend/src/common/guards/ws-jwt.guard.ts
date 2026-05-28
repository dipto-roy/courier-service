import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    // Token sourced from handshake.auth.token or query param
    const token =
      (client.handshake.auth as Record<string, string>)?.token ??
      (client.handshake.query?.token as string);

    if (!token) {
      throw new UnauthorizedException('WS connection requires auth token');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      (client as unknown as Record<string, unknown>)['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired WS token');
    }
  }
}
