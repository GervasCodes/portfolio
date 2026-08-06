'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Images } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import ProjectMediaManager from '@/components/admin/ProjectMediaManager';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';
import { uploadFile } from '@/services/upload';

const EMPTY_FORM = {
  title: '', summary: '', description: '', category: '', repo_url: '', live_url: '',
  tech_stack: '', featured: false, status: 'draft', cover_image_url: '',
};

export default function AdminProjectsPage() {
  const { checking } = useAdminAuth();
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [mediaProject, setMediaProject] = useState(null);

  const loadProjects = async () => {
    const { data } = await PortfolioAPI.getProjects({ limit: 100 });
    setProjects(data || []);
  };

  useEffect(() => {
    if (!checking) loadProjects();
  }, [checking]);

  if (checking) return null;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditingId(project.id);
    setForm({
      ...EMPTY_FORM,
      ...project,
      tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await uploadFile(file, { kind: 'image', relatedTo: 'project' });
    if (data?.file_url) setForm((f) => ({ ...f, cover_image_url: data.file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tech_stack: form.tech_stack.split(',').map((t) => t.trim()).filter(Boolean),
    };

    let createdProject = null;
    if (editingId) {
      await PortfolioAPI.updateProject(editingId, payload);
    } else {
      const { data } = await PortfolioAPI.createProject(payload);
      createdProject = data;
    }

    setSaving(false);
    setModalOpen(false);
    await loadProjects();

    // New projects don't have media yet — jump straight into the gallery
    // manager so adding screenshots/video is part of the same flow instead
    // of a separate step the user has to remember to come back for.
    if (createdProject?.id) {
      setMediaProject(createdProject);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await PortfolioAPI.deleteProject(id);
    loadProjects();
  };

  const toggleStatus = async (project) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    await PortfolioAPI.updateProject(project.id, { status: nextStatus });
    loadProjects();
  };

  return (
    <AdminShell title="Projects" description="Create, edit, and publish the projects shown on your portfolio.">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} icon={<Plus size={16} />}>New Project</Button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-white/40 border-b border-white/10">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3">{project.title}</td>
                <td className="px-5 py-3 hidden sm:table-cell text-white/50">{project.category}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleStatus(project)}
                    title="Click to toggle Draft / Published"
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${project.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                  >
                    {project.status}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setMediaProject(project)} className="p-2 text-white/50 hover:text-white" aria-label="Manage media">
                    <Images size={14} />
                  </button>
                  <button onClick={() => openEdit(project)} className="p-2 text-white/50 hover:text-white" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 text-white/50 hover:text-red-400" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {!projects.length && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-white/40">No projects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Summary" name="summary" value={form.summary} onChange={handleChange} />
          <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Category" name="category" value={form.category} onChange={handleChange} />
            <Input label="Tech Stack (comma separated)" name="tech_stack" value={form.tech_stack} onChange={handleChange} />
            <Input label="Repo URL" name="repo_url" value={form.repo_url} onChange={handleChange} />
            <Input label="Live URL" name="live_url" value={form.live_url} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Cover Image</label>
            <label className="glass glass-hover rounded-xl px-4 py-2 text-sm cursor-pointer inline-flex items-center gap-2">
              <Upload size={14} /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
            {form.cover_image_url && <span className="ml-3 text-xs text-white/40">Image attached</span>}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="accent-accent" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</Button>
          </div>
        </form>
      </Modal>

      <ProjectMediaManager
        projectId={mediaProject?.id}
        projectTitle={mediaProject?.title}
        open={Boolean(mediaProject)}
        onClose={() => setMediaProject(null)}
      />
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

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <textarea {...props} rows={4} className="w-full input-field px-4 py-2.5 text-sm resize-none" />
    </div>
  );
}
