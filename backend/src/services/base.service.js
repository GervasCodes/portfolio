const { AppError } = require('../utills/responce');

/**
 * BaseService — abstract CRUD business-logic layer sitting between
 * controllers and models. Concrete services (ProjectService, BlogService)
 * extend it and share pagination/not-found handling, while overriding
 * hooks like `beforeCreate` for resource-specific behaviour
 * (Polymorphism + Template Method pattern).
 */
class BaseService {
  /** @param {import('../models/BaseModel')} model */
  constructor(model, resourceName = 'Resource') {
    this.model = model;
    this.resourceName = resourceName;
  }

  // Hooks subclasses may override — no-ops by default.
  async beforeCreate(data) { return data; }
  async afterCreate(record) { return record; }
  async beforeUpdate(id, data) { return data; }

  async list(options = {}) {
    return this.model.findAll(options);
  }

  async getById(id) {
    const record = await this.model.findById(id);
    if (!record) throw AppError.notFound(`${this.resourceName} not found`);
    return record;
  }

  async create(data) {
    const prepared = await this.beforeCreate(data);
    const record = await this.model.create(prepared);
    return this.afterCreate(record);
  }

  async update(id, data) {
    await this.getById(id); // ensures 404 if missing
    const prepared = await this.beforeUpdate(id, data);
    return this.model.update(id, prepared);
  }

  async remove(id) {
    await this.getById(id);
    return this.model.delete(id);
  }
}

module.exports = BaseService;
