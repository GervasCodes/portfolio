const profileModel = require('../models/Profile');

/**
 * Profile doesn't need full CRUD (it's a singleton resource), so it
 * doesn't extend BaseService — a good example of composition over
 * inheritance: reuse only what actually fits the resource.
 */
class ProfileService {
  async get() {
    return profileModel.getSingleton();
  }

  async save(data) {
    return profileModel.upsert(data);
  }
}

module.exports = new ProfileService();
