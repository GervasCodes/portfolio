'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, ExternalLink } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';
import { uploadFile } from '@/services/upload';

const EMPTY_FORM = {
  title: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '', badge_image_url: '', sort_order: 0,
};

export default function AdminCertificatesPage() {
  const { checking } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await PortfolioAPI.getCertificates();
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

  const handleBadgeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await uploadFile(file, { kind: 'image', relatedTo: 'certificate' });
    if (data?.file_url) setForm((f) => ({ ...f, badge_image_url: data.file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await PortfolioAPI.updateCertificate(editingId, form);
    } else {
      await PortfolioAPI.createCertificate(form);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    await PortfolioAPI.deleteCertificate(id);
    load();
  };

  return (
    <AdminShell title="Certificates" description="Certifications and credentials shown on your resume and about page.">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} icon={<Plus size={16} />}>New Certificate</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-2xl p-5 flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {item.badge_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.badge_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/20 text-xs">No badge</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-white/50">{item.issuer}</p>
              <div className="flex items-center gap-3 mt-2">
                {item.credential_url && (
                  <a href={item.credential_url} target="_blank" rel="noreferrer" className="text-xs text-accent-light flex items-center gap-1">
                    <ExternalLink size={12} /> Credential
                  </a>
                )}
                <button onClick={() => openEdit(item)} className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-white/50 hover:text-red-400 flex items-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-white/40 col-span-2">No certificates yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Certificate' : 'New Certificate'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Issuer" name="issuer" value={form.issuer} onChange={handleChange} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Issue Date" name="issue_date" type="date" value={form.issue_date || ''} onChange={handleChange} />
            <Input label="Expiry Date" name="expiry_date" type="date" value={form.expiry_date || ''} onChange={handleChange} />
          </div>
          <Input label="Credential URL" name="credential_url" value={form.credential_url} onChange={handleChange} />

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Badge Image</label>
            <label className="glass glass-hover rounded-xl px-4 py-2 text-sm cursor-pointer inline-flex items-center gap-2">
              <Upload size={14} /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={handleBadgeUpload} />
            </label>
            {form.badge_image_url && <span className="ml-3 text-xs text-white/40">Image attached</span>}
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
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input {...props} className="w-full input-field px-4 py-2.5 text-sm" />
    </div>
  );
}
