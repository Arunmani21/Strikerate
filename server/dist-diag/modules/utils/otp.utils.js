"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.isOtpExpired = isOtpExpired;
exports.generateSecureToken = generateSecureToken;
exports.isValidEmail = isValidEmail;
exports.isValidMobile = isValidMobile;
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function isOtpExpired(expiresAt) {
    return new Date() > expiresAt;
}
function generateSecureToken() {
    return require('crypto').randomBytes(32).toString('hex');
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidMobile(mobile) {
    const mobileRegex = /^[0-9]{10,15}$/;
    return mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''));
}
//# sourceMappingURL=otp.utils.js.map