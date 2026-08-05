const BaseModel = require('./BaseModel');
const db = require('../config/database');

class BlogModel extends BaseModel {
  constructor() {
    super('blogs', [
      'title', 'slug', 'excerpt', 'content', 'cover_image_url',
      'tags', 'status', 'published_at', 'views',
    ]);
  }

  _serialize(row) {
    if (!row) return row;
    let tags = row.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = []; }
    }
    return { ...row, tags: tags || [] };
  }

  _pick(data) {
    const payload = super._pick(data);
    if (payload.tags) payload.tags = JSON.stringify(payload.tags);
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

  async incrementViews(id) {
    await db.query(`UPDATE blogs SET views = views + 1 WHERE id = ?`, [id]);
  }

  async paginatePublished({ page = 1, limit = 6, tag } = {}) {
    const clauses = [`status = 'published'`];
    const params = [];
    if (tag) {
      clauses.push(`tags LIKE ?`);
      params.push(`%"${tag}"%`);
    }
    const offset = (page - 1) * limit;
    const rows = await db.query(
      `SELECT * FROM blogs WHERE ${clauses.join(' AND ')} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const countRows = await db.query(
      `SELECT COUNT(*) AS total FROM blogs WHERE ${clauses.join(' AND ')}`,
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

module.exports = new BlogModel();
