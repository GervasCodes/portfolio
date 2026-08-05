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
}

module.exports = new AdminModel();
