import { useEffect, useState } from 'react';
import { Save, Mail, BarChart3 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';

export default function AdminSettingsPage() {
  const { checking } = useAdminAuth();
  const [settings, setSettings] = useState({});
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (checking) return;
    PortfolioAPI.getSettings().then(({ data }) => data && setSettings(data));
    PortfolioAPI.getContactMessages().then(({ data }) => data && setContacts(data));
    PortfolioAPI.getAnalytics(30).then(({ data }) => data && setAnalytics(data));
  }, [checking]);

  if (checking) return null;

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setStatus('loading');
    const { error } = await PortfolioAPI.updateSettings(settings);
    setStatus(error ? 'error' : 'success');
  };

  return (
    <AdminShell title="Settings" description="Site-wide settings, incoming messages, and traffic at a glance.">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 lg:col-span-2 space-y-4">
          <h2 className="font-semibold mb-2">Site Settings</h2>
          <Field label="Site Title" name="site_title" value={settings.site_title} onChange={handleChange} />
          <Field label="Site Description" name="site_description" value={settings.site_description} onChange={handleChange} />
          <div className="flex items-center gap-4 pt-2">
            <Button onClick={handleSave} disabled={status === 'loading'} icon={<Save size={16} />}>
              {status === 'loading' ? 'Saving...' : 'Save Settings'}
            </Button>
            {status === 'success' && <span className="text-sm text-emerald-400">Saved!</span>}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={16} /> Traffic (30 days)</h2>
          {analytics ? (
            <div className="space-y-3 text-sm">
              <Stat label="Total Visits" value={analytics.totalVisits} />
              <Stat label="Unique Visitors" value={analytics.uniqueVisitors} />
            </div>
          ) : (
            <p className="text-sm text-white/40">No analytics data yet.</p>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Mail size={16} /> Contact Messages</h2>
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="border border-white/10 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-white/40">{c.email}</span>
              </div>
              {c.subject && <p className="text-xs text-accent-light mt-1">{c.subject}</p>}
              <p className="text-sm text-white/60 mt-2">{c.message}</p>
            </div>
          ))}
          {!contacts.length && <p className="text-sm text-white/40">No messages yet.</p>}
        </div>
      </div>
    </AdminShell>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className="w-full input-field px-4 py-2.5 text-sm"
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className="font-semibold text-gradient">{value}</span>
    </div>
  );
}
