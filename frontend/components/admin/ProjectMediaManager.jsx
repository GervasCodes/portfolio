'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, ArrowUp, ArrowDown, PlayCircle, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';
import { uploadProjectMedia } from '@/services/upload';

/**
 * Admin-only gallery manager for a single project: upload images/videos,
 * edit captions, reorder, and delete — all without leaving the projects
 * table. Opened from a "Media" action next to Edit/Delete.
 */
export default function ProjectMediaManager({ projectId, projectTitle, open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadMedia = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error: err } = await PortfolioAPI.getProjectMedia(projectId);
    setItems(data || []);
    if (err) setError(err);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (open) loadMedia();
  }, [open, loadMedia]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');

    for (const file of files) {
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      // eslint-disable-next-line no-await-in-loop
      const { error: err } = await uploadProjectMedia(projectId, file, { mediaType });
      if (err) setError(err);
    }

    await loadMedia();
    setUploading(false);
    e.target.value = '';
  };

  const handleCaptionSave = async (mediaId, caption) => {
    await PortfolioAPI.updateProjectMedia(projectId, mediaId, { caption });
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Remove this media item?')) return;
    setItems((prev) => prev.filter((m) => m.id !== mediaId));
    await PortfolioAPI.deleteProjectMedia(projectId, mediaId);
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    await PortfolioAPI.reorderProjectMedia(projectId, reordered.map((m) => m.id));
  };

  return (
    <Modal open={open} onClose={onClose} title={`Media — ${projectTitle || 'Project'}`} maxWidth="max-w-3xl">
      <div className="space-y-4">
        <label className="glass glass-hover rounded-xl px-4 py-3 text-sm cursor-pointer inline-flex items-center gap-2">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload images or videos'}
          <input
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="text-sm text-white/40 py-8 text-center">Loading gallery…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-white/40 py-8 text-center">
            No media yet — upload screenshots or a demo video for this project.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div key={item.id} className="card-premium p-3 flex gap-3">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5">
                  {item.media_type === 'video' ? (
                    <>
                      <video src={item.url} className="w-full h-full object-cover" muted />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayCircle size={18} className="text-white/90" />
                      </span>
                    </>
                  ) : (
                    <Image src={item.url} alt={item.caption || ''} fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-white/40">{item.media_type}</span>
                  <input
                    defaultValue={item.caption || ''}
                    placeholder="Caption (optional)"
                    onBlur={(e) => handleCaptionSave(item.id, e.target.value)}
                    className="input-field px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="flex flex-col items-center justify-between shrink-0">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      aria-label="Move down"
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                    className="p-1 text-white/40 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
