const crypto = require('crypto');
const env = require('../config/env');
const refreshTokenModel = require('../models/RefreshToken');
const { parseDurationMs } = require('../utills/duration');
const { AppError } = require('../utills/responce');

const RAW_TOKEN_BYTES = 48;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * RefreshTokenService — issuing, rotating, and detecting reuse of the
 * long-lived refresh token that keeps an admin signed in without needing
 * a 15-minute-lived access token to be re-typed constantly.
 */
class RefreshTokenService {
  /** Creates a brand-new refresh token row + raw value for a freshly authenticated admin. */
  async issue(adminId, { ip, userAgent } = {}) {
    const raw = crypto.randomBytes(RAW_TOKEN_BYTES).toString('hex');
    const ttlMs = parseDurationMs(env.REFRESH_TOKEN_EXPIRES_IN, 30 * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(Date.now() + ttlMs);

    await refreshTokenModel.create({
      admin_id: adminId,
      token_hash: hashToken(raw),
      expires_at: expiresAt,
      user_agent: userAgent || null,
      ip: ip || null,
    });

    return { raw, expiresAt, ttlMs };
  }

  /**
   * Validates a presented raw refresh token and rotates it: the old row is
   * revoked, a new token is issued, and both are linked via `replaced_by`.
   *
   * If the presented token was already revoked (i.e. it's being replayed
   * after its legitimate rotation already happened), that's treated as
   * theft: every active token for the admin is revoked so the attacker
   * (and the legitimate admin) are both forced to log in again.
   */
  async rotate(rawToken, { ip, userAgent } = {}) {
    if (!rawToken) throw AppError.unauthorized('Refresh token missing');

    const tokenHash = hashToken(rawToken);
    const row = await refreshTokenModel.findByHash(tokenHash);

    if (!row) throw AppError.unauthorized('Invalid refresh token');

    if (row.revoked_at) {
      // Reuse of an already-rotated token — assume compromise.
      await refreshTokenModel.revokeAllForAdmin(row.admin_id);
      throw AppError.unauthorized('Refresh token reuse detected — please log in again');
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw AppError.unauthorized('Refresh token expired — please log in again');
    }

    const next = await this.issue(row.admin_id, { ip, userAgent });
    await refreshTokenModel.revoke(row.id, hashToken(next.raw));

    return { adminId: row.admin_id, ...next };
  }

  /** Revokes a single presented token (logout from this device only). */
  async revoke(rawToken) {
    if (!rawToken) return;
    const row = await refreshTokenModel.findByHash(hashToken(rawToken));
    if (row && !row.revoked_at) await refreshTokenModel.revoke(row.id);
  }

  /** Revokes every session for an admin (e.g. after a password change, or "log out everywhere"). */
  async revokeAllForAdmin(adminId) {
    await refreshTokenModel.revokeAllForAdmin(adminId);
  }
}

module.exports = new RefreshTokenService();
