const BaseModel = require('./BaseModel');

class NewsletterSubscriberModel extends BaseModel {
  constructor() {
    super('newsletter_subscribers', [
      'email', 'status', 'confirm_token', 'confirm_token_expires_at',
      'confirmed_at', 'unsubscribed_at',
    ]);
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByToken(token) {
    return this.findOne({ confirm_token: token });
  }
}

module.exports = new NewsletterSubscriberModel();
