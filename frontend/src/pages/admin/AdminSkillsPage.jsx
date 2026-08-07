import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';

const EMPTY_FORM = { name: '', category: '', proficiency: 80, icon_url: '', sort_order: 0 };

export default function AdminSkillsPage() {
  const { checking } = useAdminAuth();
  const [grouped, setGrouped] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await PortfolioAPI.getSkills();
    setGrouped(data || {});
  };

  useEffect(() => {
    if (!checking) load();
  }, [checking]);

  const categories = Object.keys(grouped);
  const allSkills = useMemo(() => categories.flatMap((c) => grouped[c]), [grouped, categories]);

  const stats = useMemo(() => {
    const total = allSkills.length;
    const avg = total ? Math.round(allSkills.reduce((s, k) => s + (Number(k.proficiency) || 0), 0) / total) : 0;
    return { total, avg, categoryCount: categories.length };
  }, [allSkills, categories]);

  const chartData = useMemo(
    () =>
      categories.map((category) => {
        const items = grouped[category];
        const avg = items.length
          ? Math.round(items.reduce((s, k) => s + (Number(k.proficiency) || 0), 0) / items.length)
          : 0;
        return { category, avg };
      }),
    [grouped, categories]
  );

  if (checking) return null;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (skill) => {
    setEditingId(skill.id);
    setForm({ ...EMPTY_FORM, ...skill });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'proficiency' || name === 'sort_order' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await PortfolioAPI.updateSkill(editingId, form);
    } else {
      await PortfolioAPI.createSkill(form);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await PortfolioAPI.deleteSkill(id);
    load();
  };

  return (
    <AdminShell title="Skills" description="Manage every skill shown on your homepage — grouped by category with live proficiency analytics.">
      {/* Analytics */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Skills" value={stats.total} />
        <StatCard label="Categories" value={stats.categoryCount} />
        <StatCard label="Average Proficiency" value={`${stats.avg}%`} />
      </div>

      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-display font-semibold text-sm mb-4 text-white/70">Average Proficiency by Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="url(#skillGradient)" />
                <defs>
                  <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} icon={<Plus size={16} />}>New Skill</Button>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold mb-4">{category}</h3>
            <div className="space-y-3">
              {grouped[category].map((skill) => (
                <div key={skill.id} className="flex items-center gap-3">
                  <GripVertical size={14} className="text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80 truncate">{skill.name}</span>
                      <span className="text-white/40">{skill.proficiency ?? 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-accent"
                        style={{ width: `${skill.proficiency ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <button onClick={() => openEdit(skill)} className="text-xs text-white/50 hover:text-white flex items-center gap-1 shrink-0">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(skill.id)} className="text-xs text-white/50 hover:text-red-400 flex items-center gap-1 shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!categories.length && <p className="text-sm text-white/40">No skills yet. Add your first one.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Skill' : 'New Skill'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Category" name="category" value={form.category} onChange={handleChange} required placeholder="e.g. Frontend" />

          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              Proficiency — {form.proficiency ?? 0}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              name="proficiency"
              value={form.proficiency ?? 0}
              onChange={handleChange}
              className="w-full accent-accent"
            />
          </div>

          <Input label="Icon URL (optional)" name="icon_url" value={form.icon_url || ''} onChange={handleChange} />
          <Input label="Sort Order" name="sort_order" type="number" value={form.sort_order ?? 0} onChange={handleChange} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs text-white/50 mb-1.5">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
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
