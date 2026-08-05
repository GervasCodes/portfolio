const BaseModel = require('./BaseModel');

class CertificateModel extends BaseModel {
  constructor() {
    super('certificates', [
      'title', 'issuer', 'issue_date', 'expiry_date', 'credential_url',
      'badge_image_url', 'sort_order',
    ]);
  }
}

module.exports = new CertificateModel();
