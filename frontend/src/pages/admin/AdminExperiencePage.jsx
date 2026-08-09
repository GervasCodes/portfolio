import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';

const TABS = [
  { key: 'work', label: 'Work Experience', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
];

const emptyForm = (type) => ({
  type,
  title: '',
  organization: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
  sort_order: 0,
});

function formatDate(date) {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export default function AdminExperiencePage() {
  const { checking } = useAdminAuth();
  const [tab, setTab] = useState('work');
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm('work'));
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await PortfolioAPI.getExperience();
    setItems(data || []);
  };

  useEffect(() => {
    if (!checking) load();
  }, [checking]);

  const visibleItems = useMemo(
    () => items
      .filter((item) => item.type === tab)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [items, tab]
  );

  if (checking) return null;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(tab));
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyForm(item.type),
      ...item,
      start_date: item.start_date ? item.start_date.slice(0, 10) : '',
      end_date: item.end_date ? item.end_date.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, end_date: form.is_current ? null : (form.end_date || null) };
    if (editingId) {
      await PortfolioAPI.updateExperience(editingId, payload);
    } else {
      await PortfolioAPI.createExperience(payload);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await PortfolioAPI.deleteExperience(id);
    load();
  };

  return (
    <AdminShell
      title="Experience & Education"
      description="Work history and education entries shown on your Experience page."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="glass rounded-xl p-1 flex gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-colors ${
                tab === key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} icon={<Plus size={16} />}>
          New {tab === 'work' ? 'Experience' : 'Education'}
        </Button>
      </div>

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-white/40 mb-1">
                {formatDate(item.start_date)} — {item.is_current ? 'Present' : formatDate(item.end_date)}
              </p>
              <h3 className="font-semibold">{item.title}</h3>
              {item.organization && <p className="text-sm text-accent-light">{item.organization}</p>}
              {item.location && <p className="text-xs text-white/40 mt-0.5">{item.location}</p>}
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
        {!visibleItems.length && (
          <p className="text-sm text-white/40">
            No {tab === 'work' ? 'work experience' : 'education'} entries yet.
          </p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Entry' : `New ${tab === 'work' ? 'Experience' : 'Education'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full input-field px-4 py-2.5 text-sm"
            >
              <option value="work">Work Experience</option>
              <option value="education">Education</option>
            </select>
          </div>

          <Input
            label={form.type === 'work' ? 'Job Title' : 'Degree / Qualification'}
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <Input
            label={form.type === 'work' ? 'Company' : 'School / Institution'}
            name="organization"
            value={form.organization}
            onChange={handleChange}
          />
          <Input label="Location" name="location" value={form.location} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="start_date" type="date" value={form.start_date || ''} onChange={handleChange} />
            <Input
              label="End Date"
              name="end_date"
              type="date"
              value={form.end_date || ''}
              onChange={handleChange}
              disabled={form.is_current}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-white/70">
            <input
              type="checkbox"
              name="is_current"
              checked={!!form.is_current}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-accent"
            />
            Currently {form.type === 'work' ? 'working here' : 'studying here'}
          </label>

          <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />
          <Input
            label="Sort Order"
            name="sort_order"
            type="number"
            value={form.sort_order ?? 0}
            onChange={handleChange}
          />

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
      <input {...props} className="w-full input-field px-4 py-2.5 text-sm disabled:opacity-40" />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <textarea {...props} rows={4} className="w-full input-field px-4 py-2.5 text-sm resize-none" />
    </div>
  );
}
