const BaseModel = require('./BaseModel');

class MediaModel extends BaseModel {
  constructor() {
    super('media', ['file_name', 'file_url', 'file_type', 'mime_type', 'size_bytes', 'related_to']);
  }
}

module.exports = new MediaModel();
