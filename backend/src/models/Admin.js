const BaseModel = require('./BaseModel');

/**
 * Admin model — thin wrapper over the `admins` table.
 * The `password` column intentionally NOT in `fillable` so that
 * BaseModel's generic `create` / `update` methods never silently
 * write it. The adminInit service inserts with a raw parameterised
 * query to keep the hash logic explicit and auditable.
 */
class AdminModel extends BaseModel {
  constructor() {
    super('admins', ['email', 'role']);
  }

  /** Find an admin by email (case-insensitive via lower-casing at call site). */
  async findByEmail(email) {
    const rows = await require('../config/database').query(
      'SELECT * FROM admins WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  // totp_secret / totp_enabled are intentionally NOT in `fillable`, for the
  // same reason as `password`: they must only ever change through these
  // explicit, auditable methods — never via a generic update() call.

  /** Stores a freshly generated secret while setup is in progress (not yet enforced). */
  async setTotpSecret(id, base32Secret) {
    await require('../config/database').query(
      'UPDATE admins SET totp_secret = ? WHERE id = ?',
      [base32Secret, id]
    );
  }

  /** Flips 2FA on — called only after a code generated from the stored secret has been verified. */
  async enableTotp(id) {
    await require('../config/database').query(
      'UPDATE admins SET totp_enabled = 1 WHERE id = ?',
      [id]
    );
  }

  /** Turns 2FA off and wipes the secret so a stale secret can never be replayed. */
  async disableTotp(id) {
    await require('../config/database').query(
      'UPDATE admins SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?',
      [id]
    );
  }
}

module.exports = new AdminModel();
