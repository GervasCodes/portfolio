const BaseService = require('./base.service');
const projectModel = require('../models/Project');
const projectMediaModel = require('../models/ProjectMedia');
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

  // Attaches the project's ordered gallery (images + videos) so callers
  // don't need a second round-trip to /projects/:id/media.
  async _withMedia(project) {
    if (!project) return project;
    const media = await projectMediaModel.findByProject(project.id);
    return { ...project, media };
  }

  async getById(id) {
    return this._withMedia(await super.getById(id));
  }

  async getBySlug(slug) {
    const project = await this.model.findBySlug(slug);
    if (!project) throw require('../utills/responce').AppError.notFound('Project not found');
    return this._withMedia(project);
  }

  async featured(limit) {
    return this.model.findFeatured(limit);
  }

  async search(params) {
    return this.model.search(params);
  }
}

module.exports = new ProjectService();
