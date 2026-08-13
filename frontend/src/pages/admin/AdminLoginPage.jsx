import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Set once the password step succeeds and the admin has 2FA enabled —
  // presence of a token means we're on the "enter your code" step.
  const [mfaToken, setMfaToken] = useState(null);
  const [code, setCode] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const finishLogin = (data) => {
    if (typeof window !== 'undefined' && data?.token) {
      window.localStorage.setItem('portfolio_token', data.token);
    }
    navigate('/admin/profile');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const { data, error } = await PortfolioAPI.login(form);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    if (data?.mfaRequired) {
      setMfaToken(data.mfaToken);
      setStatus('idle');
      return;
    }
    finishLogin(data);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const { data, error } = await PortfolioAPI.verifyMfa({ mfaToken, code });
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    finishLogin(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-premium p-8 w-full max-w-md"
      >
        {!mfaToken ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-accent to-cyan-accent mx-auto mb-4 flex items-center justify-center shadow-glow">
                <Lock size={20} className="text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold">Admin Login</h1>
              <p className="text-sm text-white/50 mt-2">Sign in to manage your portfolio content.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="w-full input-field pl-11 pr-4 py-3 text-sm"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  required
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full input-field pl-11 pr-4 py-3 text-sm"
                />
              </div>

              {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}

              <Button type="submit" disabled={status === 'loading'} className="w-full justify-center" icon={<LogIn size={16} />}>
                {status === 'loading' ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-accent to-cyan-accent mx-auto mb-4 flex items-center justify-center shadow-glow">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold">Two-Factor Authentication</h1>
              <p className="text-sm text-white/50 mt-2">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                required
                autoFocus
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full input-field px-4 py-3 text-center text-lg tracking-[0.5em]"
              />

              {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}

              <Button type="submit" disabled={status === 'loading' || code.length !== 6} className="w-full justify-center" icon={<ShieldCheck size={16} />}>
                {status === 'loading' ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
              <button
                type="button"
                onClick={() => { setMfaToken(null); setCode(''); setStatus('idle'); setErrorMsg(''); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <ArrowLeft size={12} /> Back to password
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
