const BaseModel = require('./BaseModel');

/**
 * Key/value store for site-wide settings (SEO meta, theme toggles,
 * social links, analytics IDs, etc) editable from the admin dashboard
 * without ever touching source code — see README Phase 9.
 */
class SettingsModel extends BaseModel {
  constructor() {
    super('settings', ['setting_key', 'setting_value']);
  }

  async getAll() {
    const rows = await this.findAll({ orderBy: 'setting_key ASC' });
    return rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
  }

  async set(key, value) {
    const existing = await this.findOne({ setting_key: key });
    if (existing) return this.update(existing.id, { setting_value: value });
    return this.create({ setting_key: key, setting_value: value });
  }
}

module.exports = new SettingsModel();
