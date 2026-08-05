import { api } from './api';

/**
 * Uploads a single file (image, resume, or document) to the backend,
 * which streams it to Supabase Storage and returns a public URL.
 */
export async function uploadFile(file, { kind = 'image', relatedTo } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);
  if (relatedTo) formData.append('related_to', relatedTo);

  try {
    const res = await api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: res.data?.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || err.message };
  }
}

export default uploadFile;
