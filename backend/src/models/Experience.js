const BaseModel = require('./BaseModel');

/**
 * Stores both work Experience and Education entries, disambiguated by
 * `type`, since they share an identical timeline shape. Avoids two
 * near-duplicate tables/models (DRY).
 */
class ExperienceModel extends BaseModel {
  constructor() {
    super('experiences', [
      'type', 'title', 'organization', 'location', 'start_date', 'end_date',
      'is_current', 'description', 'sort_order',
    ]);
  }

  async findByType(type) {
    return this.findAll({ where: { type }, orderBy: 'start_date DESC' });
  }
}

module.exports = new ExperienceModel();
