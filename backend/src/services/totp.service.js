const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const env = require('../config/env');

/**
 * TotpService — thin wrapper around speakeasy/qrcode so controllers never
 * touch either library directly (same rationale as EmailNotification
 * wrapping nodemailer: swap the implementation later without touching
 * callers).
 */
class TotpService {
  /**
   * Generates a new base32 secret + otpauth:// URL for enrolling an
   * authenticator app (Google Authenticator, 1Password, Authy, ...).
   */
  generateSecret(email) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${env.TOTP_ISSUER}:${email}`,
      issuer: env.TOTP_ISSUER,
    });
    return { base32: secret.base32, otpauthUrl: secret.otpauth_url };
  }

  /** Renders an otpauth:// URL as a scannable QR code data: URL. */
  async toQrCodeDataUrl(otpauthUrl) {
    return QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Verifies a 6-digit code against a base32 secret. `window: 1` allows the
   * code from one 30s step before/after now, to tolerate minor clock drift
   * between the server and the admin's phone.
   */
  verifyToken(base32Secret, token) {
    if (!base32Secret || !token) return false;
    return speakeasy.totp.verify({
      secret: base32Secret,
      encoding: 'base32',
      token: String(token).trim(),
      window: 1,
    });
  }
}

module.exports = new TotpService();
