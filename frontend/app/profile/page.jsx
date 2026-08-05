'use client';

import { useEffect, useState } from 'react';
import { Save, Upload } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';
import { uploadFile } from '@/services/upload';

const FIELDS = [
  { name: 'full_name', label: 'Full Name' },
  { name: 'title', label: 'Title' },
  { name: 'tagline', label: 'Tagline' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'location', label: 'Location' },
  { name: 'github_url', label: 'GitHub URL' },
  { name: 'linkedin_url', label: 'LinkedIn URL' },
  { name: 'instagram_url', label: 'Instagram URL' },
  { name: 'whatsapp_number', label: 'WhatsApp Number (with country code)' },
  { name: 'website_url', label: 'Website URL' },
  { name: 'years_experience', label: 'Years of Experience', type: 'number' },
];

export default function AdminProfilePage() {
  const { checking } = useAdminAuth();
  const [profile, setProfile] = useState({});
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (checking) return;
    PortfolioAPI.getProfile().then(({ data }) => data && setProfile(data));
  }, [checking]);

  if (checking) return null;

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await uploadFile(file, { kind: 'image', relatedTo: 'profile' });
    if (data?.file_url) setProfile((p) => ({ ...p, avatar_url: data.file_url }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await uploadFile(file, { kind: 'resume', relatedTo: 'profile' });
    if (data?.file_url) setProfile((p) => ({ ...p, resume_url: data.file_url }));
  };

  const handleSave = async () => {
    setStatus('loading');
    const { error } = await PortfolioAPI.saveProfile(profile);
    setStatus(error ? 'error' : 'success');
  };

  return (
    <AdminShell title="Profile" description="This information powers your public homepage, about, and resume pages.">
      <div className="glass rounded-2xl p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/30 text-xs">No photo</span>
            )}
          </div>
          <label className="glass glass-hover rounded-xl px-4 py-2 text-sm cursor-pointer flex items-center gap-2">
            <Upload size={14} /> Upload avatar
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
          <label className="glass glass-hover rounded-xl px-4 py-2 text-sm cursor-pointer flex items-center gap-2">
            <Upload size={14} /> Upload resume (PDF)
            <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.name === 'tagline' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs text-white/50 mb-1.5">{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={profile[field.name] ?? ''}
                onChange={handleChange}
                className="w-full input-field px-4 py-2.5 text-sm"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1.5">Bio</label>
          <textarea
            name="bio"
            rows={5}
            value={profile.bio ?? ''}
            onChange={handleChange}
            className="w-full input-field px-4 py-2.5 text-sm resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={Boolean(profile.available_for_work)}
            onChange={(e) => setProfile({ ...profile, available_for_work: e.target.checked })}
            className="accent-accent"
          />
          Available for work
        </label>

        <div className="flex items-center gap-4 pt-2">
          <Button onClick={handleSave} disabled={status === 'loading'} icon={<Save size={16} />}>
            {status === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
          {status === 'success' && <span className="text-sm text-emerald-400">Saved!</span>}
          {status === 'error' && <span className="text-sm text-red-400">Failed to save.</span>}
        </div>
      </div>
    </AdminShell>
  );
}
