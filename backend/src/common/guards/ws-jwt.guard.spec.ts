import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsJwtGuard } from './ws-jwt.guard';

function makeClient(token: string | undefined, queryToken?: string) {
  return {
    handshake: {
      auth: token ? { token } : {},
      query: queryToken ? { token: queryToken } : {},
    },
    data: {},
  };
}

function makeContext(client: object): ExecutionContext {
  return {
    switchToWs: jest.fn().mockReturnValue({
      getClient: jest.fn().mockReturnValue(client),
    }),
  } as unknown as ExecutionContext;
}

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtGuard,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    guard = module.get<WsJwtGuard>(WsJwtGuard);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('returns true and attaches user for valid token in auth', () => {
    const payload = { sub: 'user-1', role: 'admin' };
    jwtService.verify.mockReturnValue(payload);

    const client = makeClient('valid.jwt.token') as any;
    const ctx = makeContext(client);

    expect(guard.canActivate(ctx)).toBe(true);
    expect(client.user).toEqual(payload);
  });

  it('returns true for valid token in query params', () => {
    const payload = { sub: 'user-2', role: 'rider' };
    jwtService.verify.mockReturnValue(payload);

    const client = makeClient(undefined, 'valid.query.token') as any;
    const ctx = makeContext(client);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('prefers auth.token over query.token', () => {
    const payload = { sub: 'user-auth', role: 'admin' };
    jwtService.verify.mockReturnValue(payload);

    const client = makeClient('auth.token', 'query.token') as any;
    const ctx = makeContext(client);

    guard.canActivate(ctx);
    expect(jwtService.verify).toHaveBeenCalledWith(
      'auth.token',
      expect.any(Object),
    );
  });

  it('throws UnauthorizedException when no token provided', () => {
    const client = makeClient(undefined);
    const ctx = makeContext(client);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for invalid/expired token', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const client = makeClient('expired.token');
    const ctx = makeContext(client);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
