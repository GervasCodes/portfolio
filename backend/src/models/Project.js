const BaseModel = require('./BaseModel');
const db = require('../config/database');

class ProjectModel extends BaseModel {
  constructor() {
    super('projects', [
      'title', 'slug', 'summary', 'description', 'cover_image_url',
      'gallery', 'tech_stack', 'category', 'repo_url', 'live_url',
      'featured', 'status', 'sort_order',
    ]);
  }

  _serialize(row) {
    if (!row) return row;
    return {
      ...row,
      gallery: safeParse(row.gallery, []),
      tech_stack: safeParse(row.tech_stack, []),
      featured: Boolean(row.featured),
    };
  }

  _pick(data) {
    const payload = super._pick(data);
    if (payload.gallery) payload.gallery = JSON.stringify(payload.gallery);
    if (payload.tech_stack) payload.tech_stack = JSON.stringify(payload.tech_stack);
    return payload;
  }

  async findAll(options) {
    const rows = await super.findAll(options);
    return rows.map((r) => this._serialize(r));
  }

  async findById(id) {
    return this._serialize(await super.findById(id));
  }

  async findBySlug(slug) {
    return this._serialize(await this.findOne({ slug }));
  }

  async findFeatured(limit = 6) {
    const rows = await db.query(
      `SELECT * FROM projects WHERE featured = 1 AND status = 'published' ORDER BY sort_order ASC, id DESC LIMIT ?`,
      [limit]
    );
    return rows.map((r) => this._serialize(r));
  }

  async search({ q, category, page = 1, limit = 9, isAdmin = false }) {
    const clauses = isAdmin ? [] : [`status = 'published'`];
    const params = [];

    if (q) {
      clauses.push(`(title LIKE ? OR summary LIKE ? OR tech_stack LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) {
      clauses.push(`category = ?`);
      params.push(category);
    }

    const whereSql = clauses.length ? clauses.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;
    const rows = await db.query(
      `SELECT * FROM projects WHERE ${whereSql} ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const countRows = await db.query(
      `SELECT COUNT(*) AS total FROM projects WHERE ${whereSql}`,
      params
    );

    return {
      items: rows.map((r) => this._serialize(r)),
      total: countRows[0]?.total ?? 0,
      page: Number(page),
      limit: Number(limit),
    };
  }
}

function safeParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

module.exports = new ProjectModel();
