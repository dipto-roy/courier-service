"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../../entities/user.entity");
const utils_1 = require("../../common/utils");
const email_service_1 = require("../notifications/email.service");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    configService;
    emailService;
    constructor(userRepository, jwtService, configService, emailService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async signup(signupDto) {
        const { email, phone, password, ...rest } = signupDto;
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { phone }],
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or phone already exists');
        }
        const hashedPassword = await (0, utils_1.hashPassword)(password);
        const otpCode = (0, utils_1.generateOTP)(6);
        const otpExpiry = (0, utils_1.getOTPExpiry)(parseInt(this.configService.get('OTP_EXPIRATION') || '300'));
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
        }
        catch (error) {
            console.error('Failed to send OTP email:', error.message);
        }
        const tokens = await this.generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await this.userRepository.save(user);
        return {
            message: 'User created successfully. Please verify your account with OTP.',
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await (0, utils_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            const otpCode = (0, utils_1.generateOTP)(6);
            const otpExpiry = (0, utils_1.getOTPExpiry)(parseInt(this.configService.get('OTP_EXPIRATION') || '300'));
            user.otpCode = otpCode;
            user.otpExpiry = otpExpiry;
            await this.userRepository.save(user);
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
            }
            catch (error) {
                console.error('Failed to send OTP email:', error.message);
            }
            throw new common_1.BadRequestException('Account not verified. A new OTP has been sent.');
        }
        user.lastLogin = new Date();
        await this.userRepository.save(user);
        const tokens = await this.generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await this.userRepository.save(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async verifyOtp(verifyOtpDto) {
        const { email, otpCode } = verifyOtpDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Account already verified');
        }
        if (!user.otpCode || !user.otpExpiry) {
            throw new common_1.BadRequestException('No OTP found. Please request a new one.');
        }
        if (user.otpCode !== otpCode) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        if (!(0, utils_1.isOTPValid)(user.otpExpiry)) {
            throw new common_1.BadRequestException('OTP expired. Please request a new one.');
        }
        user.isVerified = true;
        user.otpCode = null;
        user.otpExpiry = null;
        await this.userRepository.save(user);
        const tokens = await this.generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await this.userRepository.save(user);
        return {
            message: 'Account verified successfully',
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async resendOtp(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Account already verified');
        }
        const otpCode = (0, utils_1.generateOTP)(6);
        const otpExpiry = (0, utils_1.getOTPExpiry)(parseInt(this.configService.get('OTP_EXPIRATION') || '300'));
        user.otpCode = otpCode;
        user.otpExpiry = otpExpiry;
        await this.userRepository.save(user);
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
        }
        catch (error) {
            console.error('Failed to send OTP email:', error.message);
            throw new common_1.BadRequestException('Failed to send OTP. Please try again.');
        }
        return {
            message: 'OTP sent successfully',
            email: user.email,
        };
    }
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });
            if (!user || user.refreshToken !== refreshToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = await this.generateTokens(user);
            user.refreshToken = tokens.refreshToken;
            await this.userRepository.save(user);
            return tokens;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async logout(userId) {
        await this.userRepository.update(userId, { refreshToken: null });
        return { message: 'Logged out successfully' };
    }
    async generateTokens(user) {
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
    sanitizeUser(user) {
        const { password, refreshToken, otpCode, otpExpiry, twoFaSecret, ...sanitized } = user;
        return sanitized;
    }
    async validateUser(userId) {
        return await this.userRepository.findOne({ where: { id: userId } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map