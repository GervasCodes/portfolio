const BaseService = require('./base.service');
const projectMediaModel = require('../models/ProjectMedia');
const projectModel = require('../models/Project');
const { mediaService } = require('./storage.service');
const { AppError } = require('../utills/responce');

class ProjectMediaService extends BaseService {
  constructor() {
    super(projectMediaModel, 'Project media item');
  }

  async _assertProjectExists(projectId) {
    const project = await projectModel.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');
    return project;
  }

  async listByProject(projectId) {
    await this._assertProjectExists(projectId);
    return this.model.findByProject(projectId);
  }

  /**
   * Uploads a file (image or video) to storage and attaches it to the
   * project's gallery, appended after whatever is already there.
   */
  async attach(projectId, file, { mediaType = 'image', caption } = {}) {
    await this._assertProjectExists(projectId);

    if (!['image', 'video'].includes(mediaType)) {
      throw AppError.badRequest(`Unsupported media_type: ${mediaType}`);
    }

    const result = mediaType === 'video'
      ? await mediaService.uploadVideo(file)
      : await mediaService.uploadImage(file);

    const sortOrder = await this.model.nextSortOrder(projectId);

    return this.model.create({
      project_id: projectId,
      media_type: mediaType,
      url: result.url,
      caption: caption || null,
      sort_order: sortOrder,
    });
  }

  async updateItem(projectId, mediaId, data) {
    await this._assertProjectExists(projectId);
    const item = await this.model.findById(mediaId);
    if (!item || Number(item.project_id) !== Number(projectId)) {
      throw AppError.notFound('Project media item not found');
    }
    return this.model.update(mediaId, {
      caption: data.caption,
      media_type: data.media_type,
    });
  }

  async removeItem(projectId, mediaId) {
    await this._assertProjectExists(projectId);
    const item = await this.model.findById(mediaId);
    if (!item || Number(item.project_id) !== Number(projectId)) {
      throw AppError.notFound('Project media item not found');
    }
    return this.model.delete(mediaId);
  }

  async reorder(projectId, orderedIds) {
    await this._assertProjectExists(projectId);
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      throw AppError.badRequest('orderedIds must be a non-empty array');
    }
    return this.model.reorder(projectId, orderedIds);
  }
}

module.exports = new ProjectMediaService();
