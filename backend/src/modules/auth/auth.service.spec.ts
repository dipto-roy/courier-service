import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { EmailService } from '../notifications/email.service';

jest.mock('../../common/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn().mockResolvedValue(true),
  generateOTP: jest.fn().mockReturnValue('123456'),
  getOTPExpiry: jest.fn().mockReturnValue(new Date(Date.now() + 300_000)),
  isOTPValid: jest.fn().mockReturnValue(true),
}));

import * as utils from '../../common/utils';

const mockUser: Partial<User> = {
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+8801700000001',
  password: 'hashed-password',
  isActive: true,
  isVerified: true,
  otpCode: '123456',
  otpExpiry: new Date(Date.now() + 300_000),
  refreshToken: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configService: { get: jest.Mock };
  let emailService: { sendEmail: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      verifyAsync: jest.fn().mockResolvedValue({ sub: mockUser.id }),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        const cfg: Record<string, string> = {
          OTP_EXPIRATION: '300',
          JWT_SECRET: 'secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return cfg[key];
      }),
    };

    emailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    jest.clearAllMocks();
    (utils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
    (utils.comparePassword as jest.Mock).mockResolvedValue(true);
    (utils.generateOTP as jest.Mock).mockReturnValue('123456');
    (utils.getOTPExpiry as jest.Mock).mockReturnValue(
      new Date(Date.now() + 300_000),
    );
    (utils.isOTPValid as jest.Mock).mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    const signupDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+8801700000001',
      password: 'password123',
    };

    it('creates user and sends OTP email', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      await service.signup(signupDto as any);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('throws ConflictException when email already exists', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      await expect(service.signup(signupDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('names the email when only the email collides', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        phone: '+8809999999999',
      });

      await expect(service.signup(signupDto as any)).rejects.toThrow(
        'An account with this email already exists',
      );
    });

    it('names the phone when only the phone collides', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        email: 'someone-else@example.com',
      });

      await expect(service.signup(signupDto as any)).rejects.toThrow(
        'An account with this phone number already exists',
      );
    });

    it('names both fields when email and phone collide', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.signup(signupDto as any)).rejects.toThrow(
        'An account with this email and phone number already exists',
      );
    });

    it('matches an existing email case-insensitively', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        email: 'TEST@EXAMPLE.COM',
        phone: '+8809999999999',
      });

      await expect(service.signup(signupDto as any)).rejects.toThrow(
        'An account with this email already exists',
      );
    });

    it('reports otpSent true when the OTP email is delivered', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.signup(signupDto as any);

      expect(result.otpSent).toBe(true);
      expect(result.message).toContain('Please verify your account with OTP');
    });

    it('still creates the user but reports otpSent false when email sending fails', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      emailService.sendEmail.mockRejectedValueOnce(new Error('SMTP EAUTH'));

      const result = await service.signup(signupDto as any);

      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result.otpSent).toBe(false);
      expect(result.message).toContain('could not be sent');
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('returns user and tokens for valid credentials', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.login(loginDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
    });

    it('throws UnauthorizedException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      (utils.comparePassword as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for inactive user', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        isActive: false,
      });
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws BadRequestException for unverified user and sends new OTP', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        isVerified: false,
      });
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('OTP email failures', () => {
    it('login reports the delivery failure instead of claiming an OTP was sent', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        isVerified: false,
      });
      emailService.sendEmail.mockRejectedValueOnce(new Error('SMTP EAUTH'));

      await expect(
        service.login({
          email: mockUser.email,
          password: 'password123',
        } as any),
      ).rejects.toThrow(/could not be sent/);
    });

    it('resendOtp throws ServiceUnavailableException when email sending fails', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        isVerified: false,
      });
      emailService.sendEmail.mockRejectedValueOnce(new Error('SMTP EAUTH'));

      await expect(service.resendOtp(mockUser.email as string)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('resendOtp succeeds when email sending works', async () => {
      userRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        isVerified: false,
      });

      const result = await service.resendOtp(mockUser.email as string);

      expect(result.message).toBe('OTP sent successfully');
      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    const unverifiedUser = { ...mockUser, isVerified: false };

    it('verifies OTP and returns tokens', async () => {
      userRepository.findOne.mockResolvedValueOnce(unverifiedUser);
      const result = await service.verifyOtp({
        email: 'test@example.com',
        otpCode: '123456',
      });
      expect(result).toHaveProperty('accessToken');
    });

    it('throws BadRequestException when user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      await expect(
        service.verifyOtp({ email: 'ghost@example.com', otpCode: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when OTP expired', async () => {
      userRepository.findOne.mockResolvedValueOnce(unverifiedUser);
      (utils.isOTPValid as jest.Mock).mockReturnValueOnce(false);
      await expect(
        service.verifyOtp({ email: 'test@example.com', otpCode: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('returns user for valid id', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.validateUser('user-uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('returns null when user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      const result = await service.validateUser('non-existent');
      expect(result).toBeNull();
    });
  });
});
