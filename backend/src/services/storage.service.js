const sharp = require('sharp');
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

  // eslint-disable-next-line no-unused-vars
  async list(prefix) {
    throw new Error('list() must be implemented by subclass');
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

  // Lists objects directly under `prefix` (non-recursive), newest Supabase
  // default sort aside — callers that need a specific order (e.g. the
  // backup script pruning oldest-first) should sort the returned names
  // themselves, since folder listings are lexicographic, not by date.
  async list(prefix) {
    const { data, error } = await this.client.storage.from(this.bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw AppError.badRequest(`List failed: ${error.message}`);
    return (data || []).map((item) => `${prefix}/${item.name}`);
  }
}

// Images this small are already cheap to serve; optimizing them mostly
// just burns CPU for no real savings, so skip straight past sharp.
const OPTIMIZE_SKIP_BELOW_BYTES = 20 * 1024; // 20KB

// Formats sharp can safely resize/recompress. SVGs are vector and
// re-rastering them would be a lossy downgrade; GIFs are frequently
// animated and a naive resize/recompress would collapse them to a single
// frame, so both are left untouched and stored as-is.
const OPTIMIZABLE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Longest edge an uploaded image is allowed to keep. Portfolio/project
// imagery is displayed at well under this in every layout, so anything
// larger is pure upload/storage/bandwidth waste.
const MAX_DIMENSION_PX = 2000;

/**
 * Resizes and recompresses an image buffer before it's handed to the
 * storage provider. Never throws — a corrupt or unusual image should
 * still upload successfully with its original bytes; optimization is a
 * best-effort size reduction, not a correctness requirement.
 */
async function optimizeImageBuffer(buffer, mimeType) {
  if (!OPTIMIZABLE_MIME.has(mimeType) || buffer.length < OPTIMIZE_SKIP_BELOW_BYTES) {
    return buffer;
  }

  try {
    let pipeline = sharp(buffer)
      .rotate() // bake in EXIF orientation before it's stripped
      .resize({
        width: MAX_DIMENSION_PX,
        height: MAX_DIMENSION_PX,
        fit: 'inside',
        withoutEnlargement: true,
      });

    if (mimeType === 'image/jpeg') pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    else if (mimeType === 'image/png') pipeline = pipeline.png({ compressionLevel: 9 });
    else if (mimeType === 'image/webp') pipeline = pipeline.webp({ quality: 80 });

    const optimized = await pipeline.toBuffer();
    // Only take the optimized version if it's actually smaller — a
    // tiny/already-compressed source can grow slightly after re-encoding,
    // and an upload should never come out bigger than what was sent.
    return optimized.length < buffer.length ? optimized : buffer;
  } catch (err) {
    console.warn(`[media] Image optimization failed, storing original: ${err.message}`);
    return buffer;
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
    const buffer = await optimizeImageBuffer(file.buffer, file.mimetype);
    const url = await this.provider.upload(buffer, path, file.mimetype);
    return { url, path, size: buffer.length };
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

module.exports = {
  StorageProvider,
  SupabaseStorageProvider,
  MediaService,
  mediaService: new MediaService(),
  optimizeImageBuffer,
};
