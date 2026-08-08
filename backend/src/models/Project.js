const BaseModel = require('./BaseModel');
const db = require('../config/database');

// Cards need *some* image even when the admin never explicitly set a
// Cover Image — in that case we fall back to the first item uploaded to
// the project's media gallery (project_media, ordered the same way the
// gallery/reorder UI orders it), so multi-image projects don't render
// as a blank placeholder just because "Cover Image" was left empty.
const FIRST_MEDIA_SUBQUERY = `(
  SELECT pm.url FROM project_media pm
  WHERE pm.project_id = p.id AND pm.media_type = 'image'
  ORDER BY pm.sort_order ASC, pm.id ASC
  LIMIT 1
) AS first_media_url`;

class ProjectModel extends BaseModel {
  constructor() {
    super('projects', [
      'title', 'slug', 'summary', 'description', 'cover_image_url',
      'gallery', 'tech_stack', 'category', 'repo_url', 'live_url',
      'featured', 'status', 'sort_order',
      // Case-study layout (Problem -> Approach -> Architecture -> Results),
      // an alternate way of presenting a featured project's write-up.
      'case_study_enabled', 'case_study_problem', 'case_study_approach',
      'case_study_architecture', 'case_study_results',
    ]);
  }

  _serialize(row) {
    if (!row) return row;
    const { first_media_url, ...rest } = row;
    return {
      ...rest,
      cover_image_url: row.cover_image_url || first_media_url || null,
      gallery: safeParse(row.gallery, []),
      tech_stack: safeParse(row.tech_stack, []),
      featured: Boolean(row.featured),
      case_study_enabled: Boolean(row.case_study_enabled),
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
      `SELECT p.*, ${FIRST_MEDIA_SUBQUERY} FROM projects p
       WHERE p.featured = 1 AND p.status = 'published'
       ORDER BY p.sort_order ASC, p.id DESC LIMIT ?`,
      [limit]
    );
    return rows.map((r) => this._serialize(r));
  }

  async search({ q, category, page = 1, limit = 9 }) {
    const clauses = [`p.status = 'published'`];
    const params = [];

    if (q) {
      clauses.push(`(p.title LIKE ? OR p.summary LIKE ? OR p.tech_stack LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) {
      clauses.push(`p.category = ?`);
      params.push(category);
    }

    const offset = (page - 1) * limit;
    const rows = await db.query(
      `SELECT p.*, ${FIRST_MEDIA_SUBQUERY} FROM projects p
       WHERE ${clauses.join(' AND ')}
       ORDER BY p.sort_order ASC, p.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const countRows = await db.query(
      `SELECT COUNT(*) AS total FROM projects p WHERE ${clauses.join(' AND ')}`,
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
