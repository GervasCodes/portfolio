const projectService = require('./project.service');
const blogService = require('./blog.service');

/**
 * Combines the existing per-resource LIKE searches (ProjectModel#search,
 * BlogModel#paginatePublished with `q`) behind one endpoint, so the
 * frontend search bar/results page has a single call to make regardless
 * of which type filter is selected.
 */
class SearchService {
  async search({ q, type = 'all', page = 1, limit = 9 }) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 9;

    if (type === 'projects') {
      const result = await projectService.search({ q, page: pageNum, limit: limitNum });
      return {
        items: result.items.map((item) => ({ ...item, resultType: 'project' })),
        total: result.total,
        page: pageNum,
        limit: limitNum,
      };
    }

    if (type === 'blog') {
      const result = await blogService.search({ q, page: pageNum, limit: limitNum });
      return {
        items: result.items.map((item) => ({ ...item, resultType: 'blog' })),
        total: result.total,
        page: pageNum,
        limit: limitNum,
      };
    }

    // type === 'all': a combined, best-effort view rather than true
    // unified cross-type pagination — each type is queried and paginated
    // independently, then merged. This keeps the query "simple" (per the
    // spec) at the cost of page 2 of "all" not being a perfectly seamless
    // continuation across both tables. Once the person picks a type
    // filter, that type's own search paginates exactly as normal above.
    const perType = Math.max(Math.ceil(limitNum / 2), 1);
    const [projects, blog] = await Promise.all([
      projectService.search({ q, page: pageNum, limit: perType }),
      blogService.search({ q, page: pageNum, limit: perType }),
    ]);

    return {
      items: [
        ...projects.items.map((item) => ({ ...item, resultType: 'project' })),
        ...blog.items.map((item) => ({ ...item, resultType: 'blog' })),
      ],
      total: projects.total + blog.total,
      page: pageNum,
      limit: limitNum,
    };
  }
}

module.exports = new SearchService();
