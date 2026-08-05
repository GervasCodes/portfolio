const db = require('../config/database');

/**
 * BaseModel — a generic Repository-pattern base class.
 *
 * Concrete models (Project, Blog, Skill, ...) extend this and get
 * full CRUD for free, while overriding/extending behaviour where
 * the resource needs something special. This is the Open/Closed
 * Principle in practice: new resources are added by subclassing,
 * not by editing this file.
 */
class BaseModel {
  /**
   * @param {string} table - table name
   * @param {string[]} fillable - columns allowed to be inserted/updated
   */
  constructor(table, fillable = []) {
    this.table = table;
    this.fillable = fillable;
  }

  _pick(data) {
    const picked = {};
    for (const key of this.fillable) {
      if (Object.prototype.hasOwnProperty.call(data, key)) picked[key] = data[key];
    }
    return picked;
  }

  async findAll({ where = {}, orderBy = 'id DESC', limit, offset } = {}) {
    const clauses = [];
    const params = [];
    for (const [key, value] of Object.entries(where)) {
      clauses.push(`${key} = ?`);
      params.push(value);
    }
    let sql = `SELECT * FROM ${this.table}`;
    if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
    sql += ` ORDER BY ${orderBy}`;
    if (limit !== undefined) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset) || 0);
    }
    return db.query(sql, params);
  }

  async count(where = {}) {
    const clauses = [];
    const params = [];
    for (const [key, value] of Object.entries(where)) {
      clauses.push(`${key} = ?`);
      params.push(value);
    }
    let sql = `SELECT COUNT(*) AS total FROM ${this.table}`;
    if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
    const rows = await db.query(sql, params);
    return rows[0]?.total ?? 0;
  }

  async findById(id) {
    const rows = await db.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  async findOne(where = {}) {
    const clauses = Object.keys(where).map((key) => `${key} = ?`);
    const params = Object.values(where);
    const rows = await db.query(
      `SELECT * FROM ${this.table} WHERE ${clauses.join(' AND ')} LIMIT 1`,
      params
    );
    return rows[0] || null;
  }

  async create(data) {
    const payload = this._pick(data);
    const columns = Object.keys(payload);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(payload);

    const result = await db.query(
      `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return this.findById(result.insertId);
  }

  async update(id, data) {
    const payload = this._pick(data);
    const columns = Object.keys(payload);
    if (!columns.length) return this.findById(id);

    const assignments = columns.map((col) => `${col} = ?`).join(', ');
    const values = [...Object.values(payload), id];

    await db.query(`UPDATE ${this.table} SET ${assignments} WHERE id = ?`, values);
    return this.findById(id);
  }

  async delete(id) {
    const result = await db.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = BaseModel;
