const test = require('node:test');
const assert = require('node:assert/strict');

// These services only touch the DB pool when a query actually runs — the
// hooks under test here are pure logic, so no live database is required.
const projectService = require('../src/services/project.service');
const blogService = require('../src/services/blog.service');

test('ProjectService.beforeCreate auto-generates a slug from the title', async () => {
  const data = await projectService.beforeCreate({ title: 'My Cool Project!' });
  assert.equal(data.slug, 'my-cool-project');
});

test('ProjectService.beforeCreate respects an explicit slug', async () => {
  const data = await projectService.beforeCreate({ title: 'My Project', slug: 'custom-slug' });
  assert.equal(data.slug, 'custom-slug');
});

test('BlogService.beforeCreate sets published_at when publishing without one', async () => {
  const data = await blogService.beforeCreate({ title: 'Hello World', status: 'published' });
  assert.equal(data.slug, 'hello-world');
  assert.ok(data.published_at, 'expected published_at to be set');
});

test('BlogService.beforeCreate leaves published_at unset for drafts', async () => {
  const data = await blogService.beforeCreate({ title: 'Draft Post', status: 'draft' });
  assert.equal(data.published_at, undefined);
});
