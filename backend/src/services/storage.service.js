const { getSupabaseClient } = require('../config/supabase');
const env = require('../config/env');
const { AppError } = require('../utills/responce');

/**
 * StorageProvider — abstract interface every storage backend must implement.
 * Swapping Supabase for S3/Cloudinary/local disk later means writing one
 * new class and changing a single line in `MediaService`; nothing else
 * in the app needs to know or care (Open/Closed + Dependency Inversion).
 */
class StorageProvider {
  // eslint-disable-next-line no-unused-vars
  async upload(buffer, path, mimeType) {
    throw new Error('upload() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async remove(path) {
    throw new Error('remove() must be implemented by subclass');
  }

  getPublicUrl(_path) {
    throw new Error('getPublicUrl() must be implemented by subclass');
  }
}

class SupabaseStorageProvider extends StorageProvider {
  constructor(bucket = env.SUPABASE_BUCKET) {
    super();
    this.bucket = bucket;
    this.client = getSupabaseClient();
  }

  async upload(buffer, path, mimeType) {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, buffer, { contentType: mimeType, upsert: true });

    if (error) throw AppError.badRequest(`Upload failed: ${error.message}`);
    return this.getPublicUrl(path);
  }

  async remove(path) {
    const { error } = await this.client.storage.from(this.bucket).remove([path]);
    if (error) throw AppError.badRequest(`Delete failed: ${error.message}`);
    return true;
  }

  getPublicUrl(path) {
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

/**
 * MediaService — the single entry point the rest of the app uses for
 * media handling. It depends on the StorageProvider *interface*, not
 * on Supabase specifically, and knows how to route different kinds of
 * media (images, resumes, documents) into sensible folders.
 */
class MediaService {
  constructor(provider = new SupabaseStorageProvider()) {
    this.provider = provider;
  }

  _buildPath(folder, originalName) {
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `${folder}/${timestamp}-${safeName}`;
  }

  async uploadImage(file) {
    const path = this._buildPath('images', file.originalname);
    const url = await this.provider.upload(file.buffer, path, file.mimetype);
    return { url, path };
  }

  async uploadResume(file) {
    const path = this._buildPath('resume', file.originalname);
    const url = await this.provider.upload(file.buffer, path, file.mimetype);
    return { url, path };
  }

  async uploadVideo(file) {
    const path = this._buildPath('videos', file.originalname);
    const url = await this.provider.upload(file.buffer, path, file.mimetype);
    return { url, path };
  }

  async uploadDocument(file) {
    const path = this._buildPath('documents', file.originalname);
    const url = await this.provider.upload(file.buffer, path, file.mimetype);
    return { url, path };
  }

  async delete(path) {
    return this.provider.remove(path);
  }
}

module.exports = { StorageProvider, SupabaseStorageProvider, MediaService, mediaService: new MediaService() };
