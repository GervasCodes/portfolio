const BaseService = require('./base.service');
const blogModel = require('../models/Blog');
const Validator = require('../utills/validator');
const { AppError } = require('../utills/responce');

class BlogService extends BaseService {
  constructor() {
    super(blogModel, 'Blog post');
  }

  async beforeCreate(data) {
    if (!data.slug && data.title) data.slug = Validator.toSlug(data.title);
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    return data;
  }

  async beforeUpdate(_id, data) {
    if (data.title && !data.slug) data.slug = Validator.toSlug(data.title);
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    return data;
  }

  async getBySlugAndTrackView(slug) {
    const post = await this.model.findBySlug(slug);
    if (!post) throw AppError.notFound('Blog post not found');
    await this.model.incrementViews(post.id);
    return post;
  }

  async paginatePublished(params) {
    return this.model.paginatePublished(params);
  }
}

module.exports = new BlogService();
