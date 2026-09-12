const BaseModel = require('./BaseModel');

class AchievementModel extends BaseModel {
  constructor() {
    super('achievements', ['title', 'description', 'date', 'icon_url', 'gallery', 'sort_order']);
  }

  // `gallery` is an optional array of image URLs stored as JSON — same
  // serialize/deserialize pattern as BlogModel's `tags`.
  _serialize(row) {
    if (!row) return row;
    let gallery = row.gallery;
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch { gallery = []; }
    }
    return { ...row, gallery: gallery || [] };
  }

  _pick(data) {
    const payload = super._pick(data);
    if (payload.gallery) payload.gallery = JSON.stringify(payload.gallery);
    return payload;
  }

  async findAll(options) {
    const rows = await super.findAll(options);
    return rows.map((r) => this._serialize(r));
  }

  async findById(id) {
    return this._serialize(await super.findById(id));
  }
}

module.exports = new AchievementModel();
