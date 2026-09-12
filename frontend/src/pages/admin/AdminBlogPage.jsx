import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Code, Upload, Film, Link2 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import Modal from '@/components/ui/modal';
import Markdown from '@/components/ui/Markdown';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';
import { uploadFile } from '@/services/upload';

const EMPTY_FORM = {
  title: '', excerpt: '', content: '', tags: '', status: 'draft',
  cover_image_url: '', video_url: '', link_url: '',
};

export default function AdminBlogPage() {
  const { checking } = useAdminAuth();
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('write');

  const loadPosts = async () => {
    const { data } = await PortfolioAPI.getAllPostsAdmin();
    setPosts(data || []);
  };

  useEffect(() => {
    if (!checking) loadPosts();
  }, [checking]);

  if (checking) return null;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTab('write');
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingId(post.id);
    setForm({
      ...EMPTY_FORM,
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
    });
    setTab('write');
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await uploadFile(file, { kind: 'image', relatedTo: 'blog' });
    if (data?.file_url) setForm((f) => ({ ...f, cover_image_url: data.file_url }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await uploadFile(file, { kind: 'video', relatedTo: 'blog' });
    if (data?.file_url) setForm((f) => ({ ...f, video_url: data.file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (editingId) {
      await PortfolioAPI.updatePost(editingId, payload);
    } else {
      await PortfolioAPI.createPost(payload);
    }
    setSaving(false);
    setModalOpen(false);
    loadPosts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await PortfolioAPI.deletePost(id);
    loadPosts();
  };

  return (
    <AdminShell title="Blog" description="Write and publish articles to your public blog.">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} icon={<Plus size={16} />}>New Post</Button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50 border-b border-ink/10">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Views</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-3">{post.title}</td>
                <td className="px-5 py-3 hidden sm:table-cell text-ink/50">{post.views ?? 0}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ink/5 text-ink/50'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(post)} className="p-2 text-ink/50 hover:text-ink" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 text-ink/50 hover:text-red-400" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {!posts.length && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-ink/50">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Post' : 'New Post'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-ink/50">Content (Markdown supported)</label>
              <div className="flex gap-1">
                <TabButton active={tab === 'write'} onClick={() => setTab('write')} icon={<Code size={12} />} label="Write" />
                <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={12} />} label="Preview" />
              </div>
            </div>
            {tab === 'write' ? (
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={10}
                required
                placeholder="## Heading&#10;&#10;Write your post in Markdown..."
                className="w-full input-field px-4 py-2.5 text-sm resize-y font-mono form-scroll max-h-96"
              />
            ) : (
              <div className="border border-ink/10 rounded-xl px-4 py-3 min-h-[240px] max-h-96 form-scroll bg-ink/5">
                <Markdown>{form.content}</Markdown>
              </div>
            )}
          </div>

          <Input label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">Cover Image</label>
              <label className="glass glass-hover rounded-xl px-4 py-2 text-sm cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
              {form.cover_image_url && <span className="ml-3 text-xs text-ink/50">Image attached</span>}
            </div>

            <div>
              <label className="block text-xs text-ink/50 mb-1.5">Video</label>
              <label className="glass glass-hover rounded-xl px-4 py-2 text-sm cursor-pointer inline-flex items-center gap-2">
                <Film size={14} /> Upload
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
              {form.video_url && <span className="ml-3 text-xs text-ink/50">Video attached</span>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs text-ink/50 mb-1.5"><Link2 size={12} /> Link (optional)</label>
            <input
              name="link_url"
              value={form.link_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full input-field px-4 py-2.5 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/70">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="bg-ink/5 border border-ink/10 rounded-lg px-2 py-1">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</Button>
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

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
        active ? 'bg-accent/15 text-accent-dark font-medium' : 'text-ink/50 hover:text-ink/70'
      }`}
    >
      {icon} {label}
    </button>
  );
}
