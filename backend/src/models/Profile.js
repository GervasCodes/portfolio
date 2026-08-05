const BaseModel = require('./BaseModel');

/**
 * Profile is a "singleton resource" — there is only ever one row,
 * representing the portfolio owner. Extends BaseModel but adds
 * a convenience `getSingleton`/`upsert` pair on top of generic CRUD.
 */
class ProfileModel extends BaseModel {
  constructor() {
    super('profiles', [
      'full_name', 'title', 'tagline', 'bio', 'avatar_url', 'resume_url',
      'email', 'phone', 'location', 'github_url', 'linkedin_url',
      'twitter_url', 'instagram_url', 'whatsapp_number',
      'website_url', 'years_experience', 'available_for_work',
    ]);
  }

  async getSingleton() {
    const rows = await this.findAll({ orderBy: 'id ASC', limit: 1, offset: 0 });
    return rows[0] || null;
  }

  async upsert(data) {
    const existing = await this.getSingleton();
    if (existing) return this.update(existing.id, data);
    return this.create(data);
  }
}

module.exports = new ProfileModel();
