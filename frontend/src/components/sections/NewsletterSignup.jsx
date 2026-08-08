import { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';

/**
 * "Notify me on new posts" signup — double opt-in, so submitting just
 * asks the visitor to check their inbox rather than subscribing them
 * outright. Used on the Blog page; small enough to drop anywhere else
 * (e.g. the footer) too.
 */
export default function NewsletterSignup({ className = '' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    const { data, error } = await PortfolioAPI.subscribeNewsletter(email);
    if (error) {
      setStatus('error');
      setMessage(error);
      return;
    }
    setStatus('done');
    setMessage(data?.message || 'Check your inbox to confirm.');
  };

  if (status === 'done') {
    return (
      <div className={`glass rounded-2xl p-6 flex items-center gap-3 ${className}`}>
        <CheckCircle2 className="text-emerald-400 shrink-0" size={22} />
        <p className="text-sm text-white/70">{message}</p>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <h3 className="font-display font-semibold flex items-center gap-2 mb-1">
        <Mail size={16} className="text-accent-light" /> Get notified on new posts
      </h3>
      <p className="text-sm text-white/50 mb-4">No spam — just an email when something new goes up.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 input-field px-4 py-2.5 text-sm"
        />
        <Button type="submit" disabled={status === 'loading'} icon={<Send size={15} />}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {status === 'error' && <p className="text-sm text-red-400 mt-2">{message}</p>}
    </div>
  );
}
