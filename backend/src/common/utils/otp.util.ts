/**
 * Generate a random OTP code
 * @param length - Length of OTP (default: 6)
 * @returns OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

/**
 * Verify if OTP is still valid
 * @param otpExpiry - OTP expiry timestamp
 * @returns boolean
 */
export function isOTPValid(otpExpiry: Date): boolean {
  return new Date() < new Date(otpExpiry);
}

/**
 * Get OTP expiry time
 * @param seconds - Expiry time in seconds (default: 300 = 5 minutes)
 * @returns Date object
 */
export function getOTPExpiry(seconds: number = 300): Date {
  return new Date(Date.now() + seconds * 1000);
}
