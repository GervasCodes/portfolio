import { useEffect, useState } from 'react';
import { Save, Mail, Activity, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PortfolioAPI } from '@/services/api';

export default function AdminSettingsPage() {
  const { checking } = useAdminAuth();
  const [settings, setSettings] = useState({});
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [newsletterStats, setNewsletterStats] = useState(null);
  const [status, setStatus] = useState('idle');
  const [totpEnabled, setTotpEnabled] = useState(null);

  useEffect(() => {
    if (checking) return;
    PortfolioAPI.getSettings().then(({ data }) => data && setSettings(data));
    PortfolioAPI.getContactMessages().then(({ data }) => data && setContacts(data));
    PortfolioAPI.getAnalytics(30).then(({ data }) => data && setAnalytics(data));
    PortfolioAPI.getNewsletterStats(30).then(({ data }) => data && setNewsletterStats(data));
    PortfolioAPI.me().then(({ data }) => data && setTotpEnabled(Boolean(data.user?.totpEnabled)));
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
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-accent-light" /> Traffic (30 days)
          </h2>
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
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Users size={16} /> Newsletter Signups (30 days)</h2>
        {newsletterStats ? (
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-3 text-sm">
              <Stat label="Total Subscribers" value={newsletterStats.totalSubscribers} />
              <Stat label="Confirmed" value={newsletterStats.confirmedSubscribers} />
            </div>
            <div className="sm:col-span-2 h-48">
              {newsletterStats.dailyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={newsletterStats.dailyTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Area type="monotone" dataKey="signups" stroke="#c9a267" fill="url(#newsletterGradient)" strokeWidth={2} />
                    <defs>
                      <linearGradient id="newsletterGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a267" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#c9a267" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-white/40">No signups in this window yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/40">No newsletter data yet.</p>
        )}
      </div>

      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck size={16} /> Two-Factor Authentication</h2>
        {totpEnabled === null ? (
          <p className="text-sm text-white/40">Checking status...</p>
        ) : (
          <TwoFactorCard enabled={totpEnabled} onChange={setTotpEnabled} />
        )}
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

function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input
        type={type}
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

/** Enroll/confirm/disable flow for TOTP-based 2FA on the admin account. */
function TwoFactorCard({ enabled, onChange }) {
  const [setup, setSetup] = useState(null); // { secret, otpauthUrl, qrCodeDataUrl }
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const startSetup = async () => {
    setStatus('loading');
    setErrorMsg('');
    const { data, error } = await PortfolioAPI.setupTotp();
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    setSetup(data);
    setStatus('idle');
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const { error } = await PortfolioAPI.enableTotp(code);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    setSetup(null);
    setCode('');
    setStatus('idle');
    onChange(true);
  };

  const disable = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const { error } = await PortfolioAPI.disableTotp(password);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    setPassword('');
    setStatus('idle');
    onChange(false);
  };

  if (enabled) {
    return (
      <form onSubmit={disable} className="space-y-3 max-w-sm">
        <p className="text-sm text-white/60">Two-factor authentication is currently <span className="text-emerald-400">enabled</span>.</p>
        <Field label="Current password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}
        <Button type="submit" variant="danger" size="sm" disabled={status === 'loading' || !password} icon={<ShieldOff size={14} />}>
          {status === 'loading' ? 'Disabling...' : 'Disable 2FA'}
        </Button>
      </form>
    );
  }

  if (!setup) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-white/60">Two-factor authentication is currently <span className="text-white/40">disabled</span>. Require an authenticator app code at login.</p>
        {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}
        <Button onClick={startSetup} size="sm" disabled={status === 'loading'} icon={<ShieldCheck size={14} />}>
          {status === 'loading' ? 'Starting...' : 'Set Up 2FA'}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={confirmSetup} className="space-y-4 max-w-sm">
      <p className="text-sm text-white/60">Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password, ...), then enter the 6-digit code it shows.</p>
      {setup.qrCodeDataUrl && (
        <img src={setup.qrCodeDataUrl} alt="2FA QR code" className="rounded-xl border border-white/10 bg-white p-2 w-40 h-40" />
      )}
      <details className="text-xs text-white/40">
        <summary className="cursor-pointer">Can&apos;t scan? Enter manually</summary>
        <code className="block mt-1 break-all">{setup.secret}</code>
      </details>
      <input
        required
        autoFocus
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="w-full input-field px-4 py-2.5 text-sm text-center tracking-[0.4em]"
      />
      {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={status === 'loading' || code.length !== 6}>
          {status === 'loading' ? 'Confirming...' : 'Confirm & Enable'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setSetup(null)}>Cancel</Button>
      </div>
    </form>
  );
}
