const BaseService = require('./base.service');
const blogModel = require('../models/Blog');
const Validator = require('../utills/validator');
const { AppError } = require('../utills/responce');
const { blogEngagementService } = require('./blogEngagement.service');
const newsletterService = require('./newsletter.service');

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

  // A post created already-published (vs. saved as a draft first) is
  // still a "new post" from a subscriber's perspective.
  async afterCreate(record) {
    if (record.status === 'published') this._notifySubscribers(record);
    return record;
  }

  // Only the draft -> published transition should notify — re-saving an
  // already-published post (typo fix, etc.) must not re-blast subscribers.
  async afterUpdate(_id, record, previous) {
    if (record.status === 'published' && previous.status !== 'published') {
      this._notifySubscribers(record);
    }
    return record;
  }

  // Fire-and-forget: a flaky SMTP send must never fail the publish itself.
  _notifySubscribers(post) {
    newsletterService.notifyNewPost(post).catch((err) => {
      console.error('[newsletter] Failed to notify subscribers of new post:', err.message);
    });
  }

  /** Looks up a post by slug without touching the view counter. */
  async getBySlug(slug) {
    const post = await this.model.findBySlug(slug);
    if (!post) throw AppError.notFound('Blog post not found');
    return post;
  }

  async getBySlugAndTrackView(slug, { viewerKey, ip } = {}) {
    const post = await this.getBySlug(slug);
    const counted = await blogEngagementService.recordView({ blogId: post.id, viewerKey, ip });
    return counted ? { ...post, views: post.views + 1 } : post;
  }

  async paginatePublished(params) {
    return this.model.paginatePublished(params);
  }

  async getMostViewed({ limit } = {}) {
    return this.model.getMostViewed({ limit });
  }

  // Thin alias so SearchService can call project/blog services the same
  // way (project.service already exposes `search`).
  async search({ q, page, limit }) {
    return this.model.paginatePublished({ q, page, limit });
  }
}

module.exports = new BlogService();
