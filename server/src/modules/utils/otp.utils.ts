/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP is expired
 */
export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Generate a secure token for password reset
 */
export function generateSecureToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile format (basic validation)
 */
export function isValidMobile(mobile: string): boolean {
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''));
}
