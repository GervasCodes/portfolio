const contactModel = require('../models/Contact');
const { notifyNewContactMessage } = require('../services/email.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

const submitContact = asyncHandler(async (req, res) => {
  const name = Validator.isString(req.body.name, 'name', { min: 1, max: 100 });
  const email = Validator.isEmail(req.body.email);
  const message = Validator.isString(req.body.message, 'message', { min: 5, max: 5000 });
  const subject = req.body.subject ? Validator.isString(req.body.subject, 'subject', { max: 200 }) : null;

  const contact = await contactModel.create({ name, email, subject, message, is_read: false });
  await notifyNewContactMessage(contact);

  return ApiResponse.created(res, { message: 'Message sent — thank you for reaching out!' });
});

const listContacts = asyncHandler(async (_req, res) => {
  const items = await contactModel.findAll();
  return ApiResponse.success(res, { data: items });
});

const markContactRead = asyncHandler(async (req, res) => {
  const item = await contactModel.update(req.params.id, { is_read: true });
  return ApiResponse.success(res, { data: item });
});

const deleteContact = asyncHandler(async (req, res) => {
  await contactModel.delete(req.params.id);
  return ApiResponse.success(res, { message: 'Message deleted' });
});

module.exports = { submitContact, listContacts, markContactRead, deleteContact };
