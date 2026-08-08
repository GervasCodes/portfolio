const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * RefreshToken model — thin wrapper over the `refresh_tokens` table.
 * Only ever stores/queries the SHA-256 hash of the raw token; the raw
 * value itself lives only in the admin's httpOnly cookie and is never
 * persisted (same principle as bcrypt-hashed passwords: the server should
 * not be able to hand back a usable secret even if the DB leaks).
 */
class RefreshTokenModel extends BaseModel {
  constructor() {
    super('refresh_tokens', ['admin_id', 'token_hash', 'expires_at', 'user_agent', 'ip']);
  }

  /** Looks up a token row by its hash regardless of revoked/expired state — the caller decides what to do with each case. */
  async findByHash(tokenHash) {
    const rows = await db.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
      [tokenHash]
    );
    return rows[0] || null;
  }

  /** Marks a token consumed by rotation, recording which token replaced it (useful for reuse-detection audits). */
  async revoke(id, replacedByHash = null) {
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by = ? WHERE id = ?',
      [replacedByHash, id]
    );
  }

  /** Revokes every still-active token for an admin — used on logout and when token reuse (theft) is detected. */
  async revokeAllForAdmin(adminId) {
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE admin_id = ? AND revoked_at IS NULL',
      [adminId]
    );
  }
}

module.exports = new RefreshTokenModel();
