const BaseModel = require('./BaseModel');

class AchievementModel extends BaseModel {
  constructor() {
    super('achievements', ['title', 'description', 'date', 'icon_url', 'sort_order']);
  }
}

module.exports = new AchievementModel();
