const BaseModel = require('./BaseModel');

class SkillModel extends BaseModel {
  constructor() {
    super('skills', ['name', 'category', 'proficiency', 'icon_url', 'sort_order']);
  }

  async findGroupedByCategory() {
    const rows = await this.findAll({ orderBy: 'category ASC, sort_order ASC' });
    return rows.reduce((groups, skill) => {
      groups[skill.category] = groups[skill.category] || [];
      groups[skill.category].push(skill);
      return groups;
    }, {});
  }
}

module.exports = new SkillModel();
