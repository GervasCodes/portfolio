import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';
import { uploadFile } from '@/services/upload';

const EMPTY_FORM = { title: '', description: '', date: '', sort_order: 0, gallery: [] };

export default function AdminAchievementsPage() {
  const { checking } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await PortfolioAPI.getAchievements();
    setItems(data || []);
  };

  useEffect(() => {
    if (!checking) load();
  }, [checking]);

  if (checking) return null;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...EMPTY_FORM, ...item });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const { data } = await uploadFile(file, { kind: 'image', relatedTo: 'achievement' });
        return data?.file_url;
      })
    );
    setForm((f) => ({ ...f, gallery: [...(f.gallery || []), ...uploaded.filter(Boolean)] }));
    e.target.value = '';
  };

  const removeGalleryImage = (url) => {
    setForm((f) => ({ ...f, gallery: (f.gallery || []).filter((u) => u !== url) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await PortfolioAPI.updateAchievement(editingId, form);
    } else {
      await PortfolioAPI.createAchievement(form);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    await PortfolioAPI.deleteAchievement(id);
    load();
  };

  return (
    <AdminShell title="Achievements" description="Notable milestones and awards shown on your about page.">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} icon={<Plus size={16} />}>New Achievement</Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              {item.date && <p className="text-xs text-ink/50 mt-0.5">{new Date(item.date).toLocaleDateString()}</p>}
              {item.description && <p className="text-sm text-ink/55 mt-2">{item.description}</p>}
              {Array.isArray(item.gallery) && item.gallery.length > 0 && (
                <p className="text-[11px] text-accent-dark mt-2">{item.gallery.length} photo{item.gallery.length > 1 ? 's' : ''} attached</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(item)} className="p-2 text-ink/50 hover:text-ink" aria-label="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-ink/50 hover:text-red-400" aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-ink/50">No achievements yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Achievement' : 'New Achievement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Date" name="date" type="date" value={form.date || ''} onChange={handleChange} />
          <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />

          <div>
            <label className="block text-xs text-ink/50 mb-1.5">Image Gallery (optional)</label>
            <div className="flex flex-wrap gap-3">
              {(form.gallery || []).map((url) => (
                <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden glass group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg glass glass-hover flex items-center justify-center cursor-pointer text-ink/50">
                <Upload size={16} />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </label>
            </div>
            <p className="text-[11px] text-ink/40 mt-1.5">Optional — add one or more photos for this achievement.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-ink/50 mb-1.5">{label}</label>
      <input {...props} className="w-full input-field px-4 py-2.5 text-sm" />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-ink/50 mb-1.5">{label}</label>
      <textarea {...props} rows={4} className="w-full input-field px-4 py-2.5 text-sm resize-y form-scroll max-h-64" />
    </div>
  );
}
