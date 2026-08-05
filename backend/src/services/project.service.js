const BaseService = require('./base.service');
const projectModel = require('../models/Project');
const Validator = require('../utills/validator');

class ProjectService extends BaseService {
  constructor() {
    super(projectModel, 'Project');
  }

  // Override: auto-generate a unique slug from the title on creation.
  async beforeCreate(data) {
    if (!data.slug && data.title) data.slug = Validator.toSlug(data.title);
    return data;
  }

  async beforeUpdate(_id, data) {
    if (data.title && !data.slug) data.slug = Validator.toSlug(data.title);
    return data;
  }

  async getBySlug(slug) {
    const project = await this.model.findBySlug(slug);
    if (!project) throw require('../utills/responce').AppError.notFound('Project not found');
    return project;
  }

  async featured(limit) {
    return this.model.findFeatured(limit);
  }

  async search(params) {
    return this.model.search(params);
  }
}

module.exports = new ProjectService();
