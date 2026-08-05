const test = require('node:test');
const assert = require('node:assert/strict');
const { AppError } = require('../src/utills/responce');

test('AppError factory methods set the right status codes', () => {
  assert.equal(AppError.badRequest().statusCode, 400);
  assert.equal(AppError.unauthorized().statusCode, 401);
  assert.equal(AppError.forbidden().statusCode, 403);
  assert.equal(AppError.notFound().statusCode, 404);
  assert.equal(AppError.conflict().statusCode, 409);
});

test('AppError carries a custom message and marks itself operational', () => {
  const err = AppError.notFound('Project not found');
  assert.equal(err.message, 'Project not found');
  assert.equal(err.isOperational, true);
  assert.ok(err instanceof Error);
});
