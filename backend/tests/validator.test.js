const test = require('node:test');
const assert = require('node:assert/strict');
const Validator = require('../src/utills/validator');
const { AppError } = require('../src/utills/responce');

test('isRequired throws on empty values', () => {
  assert.throws(() => Validator.isRequired('', 'name'), AppError);
  assert.throws(() => Validator.isRequired(null, 'name'), AppError);
  assert.throws(() => Validator.isRequired(undefined, 'name'), AppError);
  assert.equal(Validator.isRequired('hello', 'name'), 'hello');
});

test('isEmail validates and normalizes', () => {
  assert.equal(Validator.isEmail('  User@Example.com '), 'user@example.com');
  assert.throws(() => Validator.isEmail('not-an-email'), AppError);
});

test('isString enforces min/max length', () => {
  assert.equal(Validator.isString('hi', 'field', { min: 1 }), 'hi');
  assert.throws(() => Validator.isString('hi', 'field', { min: 5 }), AppError);
  assert.throws(() => Validator.isString('too long text', 'field', { max: 5 }), AppError);
});

test('isOneOf restricts to an allow-list', () => {
  assert.equal(Validator.isOneOf('work', 'type', ['work', 'education']), 'work');
  assert.throws(() => Validator.isOneOf('other', 'type', ['work', 'education']), AppError);
});

test('toSlug produces a URL-safe slug', () => {
  assert.equal(Validator.toSlug('Hello, World! 2024'), 'hello-world-2024');
  assert.equal(Validator.toSlug('  --Leading and Trailing--  '), 'leading-and-trailing');
});

test('paginationParams clamps page and limit', () => {
  assert.deepEqual(Validator.paginationParams({}), { page: 1, limit: 10, offset: 0 });
  assert.deepEqual(Validator.paginationParams({ page: '3', limit: '5' }), { page: 3, limit: 5, offset: 10 });
  assert.deepEqual(Validator.paginationParams({ page: '-1', limit: '500' }), { page: 1, limit: 100, offset: 0 });
});
