/**
 * Integration tests against a REAL MySQL database.
 *
 * These are skipped automatically unless INTEGRATION_TEST_DB=1 is set,
 * since they need actual DB_* env vars pointing at a throwaway database
 * (never run this against production data — it inserts and deletes rows).
 *
 * Local setup:
 *   mysql -u root -e "CREATE DATABASE portfolio_test;"
 *   DB_NAME=portfolio_test npm run migrate
 *   INTEGRATION_TEST_DB=1 DB_NAME=portfolio_test npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const RUN_INTEGRATION = process.env.INTEGRATION_TEST_DB === '1';
const describe = RUN_INTEGRATION ? test : test.skip;

describe('Project + Blog services against a real database', async (t) => {
  const projectService = require('../src/services/project.service');
  const blogService = require('../src/services/blog.service');
  const db = require('../src/config/database');

  let createdProjectId;
  let createdBlogId;

  await t.test('creates and retrieves a project by slug', async () => {
    const project = await projectService.create({
      title: `Integration Test Project ${Date.now()}`,
      summary: 'Created by the integration test suite',
      status: 'published',
      featured: false,
      tech_stack: ['Node.js'],
    });
    createdProjectId = project.id;
    assert.ok(project.slug);

    const fetched = await projectService.getBySlug(project.slug);
    assert.equal(fetched.id, project.id);
    assert.deepEqual(fetched.tech_stack, ['Node.js']);
  });

  await t.test('paginates projects with LIMIT/OFFSET placeholders', async () => {
    const result = await projectService.search({ page: 1, limit: 5 });
    assert.ok(Array.isArray(result.items));
    assert.ok(result.total >= 1);
  });

  await t.test('creates a blog post and increments its view count', async () => {
    const post = await blogService.create({
      title: `Integration Test Post ${Date.now()}`,
      content: '# Hello\n\nFrom the integration suite.',
      status: 'published',
      tags: ['integration'],
    });
    createdBlogId = post.id;

    const viewed = await blogService.getBySlugAndTrackView(post.slug);
    assert.equal(viewed.views, 0); // value read before the increment applies
    const viewedAgain = await blogService.getBySlugAndTrackView(post.slug);
    assert.equal(viewedAgain.views, 1);
  });

  await t.test('cleanup', async () => {
    if (createdProjectId) await projectService.remove(createdProjectId);
    if (createdBlogId) await blogService.remove(createdBlogId);
    await db.close();
  });
});
