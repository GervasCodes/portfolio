const BaseModel = require('./BaseModel');

class ContactModel extends BaseModel {
  constructor() {
    super('contacts', ['name', 'email', 'subject', 'message', 'is_read']);
  }
}

module.exports = new ContactModel();
