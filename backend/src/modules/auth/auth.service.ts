import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
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

const SECONDS_PER_MINUTE = 60;
const DEFAULT_OTP_EXPIRATION_SECONDS = '300';
const DEFAULT_OTP_LENGTH = '6';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private getOtpLength(): number {
    return parseInt(
      this.configService.get('OTP_LENGTH') || DEFAULT_OTP_LENGTH,
      10,
    );
  }

  private getOtpExpirySeconds(): number {
    return parseInt(
      this.configService.get('OTP_EXPIRATION') ||
        DEFAULT_OTP_EXPIRATION_SECONDS,
      10,
    );
  }

  /**
   * Sends the OTP verification email.
   * Returns false (and logs the cause) instead of throwing, so each caller
   * decides whether a mail failure should block its flow.
   */
  private async sendOtpEmail(user: User, otpCode: string): Promise<boolean> {
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your FastX Courier Account',
        template: 'otp-verification',
        context: {
          userName: user.name,
          otp: otpCode,
          expiryMinutes: Math.ceil(
            this.getOtpExpirySeconds() / SECONDS_PER_MINUTE,
          ),
        },
      });

      this.logger.log(`OTP email sent to ${user.email}`);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send OTP email to ${user.email}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Names the field that actually collided. The lookup is a single OR query, so
   * without this the client cannot tell an email clash from a phone clash and
   * keeps retrying with a new email while the phone stays duplicated.
   */
  private describeSignupConflict(
    existingUser: User,
    email: string,
    phone: string,
  ): string {
    const emailTaken =
      existingUser.email?.toLowerCase() === email.toLowerCase();
    const phoneTaken = existingUser.phone === phone;

    if (emailTaken && phoneTaken) {
      return 'An account with this email and phone number already exists';
    }

    if (emailTaken) {
      return 'An account with this email already exists';
    }

    return 'An account with this phone number already exists';
  }

  async signup(signupDto: SignupDto) {
    const { email, phone, password, ...rest } = signupDto;

    // Soft-deleted rows are excluded here and by the partial unique indexes, so
    // a deleted account's email/phone can be registered again.
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException(
        this.describeSignupConflict(existingUser, email, phone),
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP for email verification
    const otpCode = generateOTP(this.getOtpLength());
    const otpExpiry = getOTPExpiry(this.getOtpExpirySeconds());

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

    // Send OTP via email. A mail failure must not fail registration, but the
    // response has to report it so the client can prompt for a resend.
    const otpSent = await this.sendOtpEmail(user, otpCode);

    // Generate tokens (user can access app but needs to verify)
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      message: otpSent
        ? 'User created successfully. Please verify your account with OTP.'
        : 'User created successfully, but the verification email could not be sent. Please request a new OTP.',
      otpSent,
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
      const otpCode = generateOTP(this.getOtpLength());
      const otpExpiry = getOTPExpiry(this.getOtpExpirySeconds());

      user.otpCode = otpCode;
      user.otpExpiry = otpExpiry;
      await this.userRepository.save(user);

      // Send OTP via email
      const otpSent = await this.sendOtpEmail(user, otpCode);

      throw new BadRequestException(
        otpSent
          ? 'Account not verified. A new OTP has been sent.'
          : 'Account not verified. The verification email could not be sent. Please request a new OTP.',
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
    const otpCode = generateOTP(this.getOtpLength());
    const otpExpiry = getOTPExpiry(this.getOtpExpirySeconds());

    user.otpCode = otpCode;
    user.otpExpiry = otpExpiry;
    await this.userRepository.save(user);

    // Send OTP via email. Sending is the whole point of this endpoint, so a
    // failure here must surface as an error rather than a success response.
    const otpSent = await this.sendOtpEmail(user, otpCode);

    if (!otpSent) {
      throw new ServiceUnavailableException(
        'Failed to send OTP. Please try again.',
      );
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
    const {
      password,
      refreshToken,
      otpCode,
      otpExpiry,
      twoFaSecret,
      ...sanitized
    } = user;
    return sanitized;
  }

  async validateUser(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }
}
