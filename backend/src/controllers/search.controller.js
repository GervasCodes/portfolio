const searchService = require('../services/search.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');

const search = asyncHandler(async (req, res) => {
  const { q, type, page, limit } = req.query;
  const result = await searchService.search({ q, type, page, limit });
  return ApiResponse.success(res, {
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      type: type || 'all',
      q: q || '',
    },
  });
});

module.exports = { search };
