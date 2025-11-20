"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.isOTPValid = isOTPValid;
exports.getOTPExpiry = getOTPExpiry;
function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
}
function isOTPValid(otpExpiry) {
    return new Date() < new Date(otpExpiry);
}
function getOTPExpiry(seconds = 300) {
    return new Date(Date.now() + seconds * 1000);
}
//# sourceMappingURL=otp.util.js.map