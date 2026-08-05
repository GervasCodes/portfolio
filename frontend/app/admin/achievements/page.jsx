'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';

const EMPTY_FORM = { title: '', description: '', date: '', sort_order: 0 };

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
              {item.date && <p className="text-xs text-white/40 mt-0.5">{new Date(item.date).toLocaleDateString()}</p>}
              {item.description && <p className="text-sm text-white/55 mt-2">{item.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(item)} className="p-2 text-white/50 hover:text-white" aria-label="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-white/50 hover:text-red-400" aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-white/40">No achievements yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Achievement' : 'New Achievement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Date" name="date" type="date" value={form.date || ''} onChange={handleChange} />
          <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />

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
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-light transition-colors" />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <textarea {...props} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-light transition-colors resize-none" />
    </div>
  );
}
