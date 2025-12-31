import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
import {
  hashPassword,
  comparePassword,
  generateOTP,
  getOTPExpiry,
  isOTPValid,
} from '../../common/utils';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, phone, password, ...rest } = signupDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP for email verification
    const otpCode = generateOTP(6);
    const otpExpiry = getOTPExpiry(
      parseInt(this.configService.get('OTP_EXPIRATION') || '300'),
    );

    // Create user
    const user = this.userRepository.create({
      email,
      phone,
      password: hashedPassword,
      otpCode,
      otpExpiry,
      isVerified: false,
      ...rest,
    });

    await this.userRepository.save(user);

    // Send OTP via email
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: 'Verify Your FastX Courier Account',
        template: 'otp-verification',
        context: {
          userName: user.name,
          otp: otpCode,
          expiryMinutes: 5,
        },
      });
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send OTP email:', error.message);
    }

    // Generate tokens (user can access app but needs to verify)
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      message: 'User created successfully. Please verify your account with OTP.',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Regenerate and send new OTP
      const otpCode = generateOTP(6);
      const otpExpiry = getOTPExpiry(
        parseInt(this.configService.get('OTP_EXPIRATION') || '300'),
      );

      user.otpCode = otpCode;
      user.otpExpiry = otpExpiry;
      await this.userRepository.save(user);

      // Send OTP via email
      try {
        await this.emailService.sendEmail({
          to: user.email,
          subject: 'Verify Your FastX Courier Account',
          template: 'otp-verification',
          context: {
            userName: user.name,
            otp: otpCode,
            expiryMinutes: 5,
          },
        });
      } catch (error) {
        console.error('Failed to send OTP email:', error.message);
      }

      throw new BadRequestException(
        'Account not verified. A new OTP has been sent.',
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otpCode } = verifyOtpDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account already verified');
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (user.otpCode !== otpCode) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!isOTPValid(user.otpExpiry)) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    // Mark user as verified
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiry = null;
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      message: 'Account verified successfully',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async resendOtp(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account already verified');
    }

    // Generate new OTP
    const otpCode = generateOTP(6);
    const otpExpiry = getOTPExpiry(
      parseInt(this.configService.get('OTP_EXPIRATION') || '300'),
    );

    user.otpCode = otpCode;
    user.otpExpiry = otpExpiry;
    await this.userRepository.save(user);

    // Send OTP via email
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: 'Verify Your FastX Courier Account',
        template: 'otp-verification',
        context: {
          userName: user.name,
          otp: otpCode,
          expiryMinutes: 5,
        },
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error.message);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    return {
      message: 'OTP sent successfully',
      email: user.email,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await this.userRepository.save(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, otpCode, otpExpiry, twoFaSecret, ...sanitized } = user;
    return sanitized;
  }

  async validateUser(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }
}
