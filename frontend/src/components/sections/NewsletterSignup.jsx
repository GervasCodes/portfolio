import { useState } from 'react';
import { Mail, Send, CheckCircle2, Info } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';

/**
 * "Notify me on new posts" signup — double opt-in, so submitting just
 * asks the visitor to check their inbox rather than subscribing them
 * outright. Used on the Blog page; small enough to drop anywhere else
 * (e.g. the footer) too.
 *
 * Three distinct outcomes, deliberately styled differently so a returning
 * visitor isn't told to go check an inbox that will never receive anything:
 *  - new / re-subscribing -> green "check your inbox"
 *  - already confirmed    -> amber "this email is already on the list"
 *  - failure              -> inline red error, form stays filled in
 */
export default function NewsletterSignup({ className = '' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | exists | error
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
    // The backend flags a duplicate explicitly rather than making us
    // pattern-match on the copy it sent back.
    setStatus(data?.alreadyConfirmed ? 'exists' : 'done');
    setMessage(data?.message || 'Check your inbox to confirm.');
  };

  if (status === 'exists') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`glass rounded-2xl p-6 flex items-start gap-3 border border-amber-500/25 ${className}`}
      >
        <Info className="text-amber-400 shrink-0 mt-0.5" size={20} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink/85">You&apos;re already subscribed</p>
          <p className="text-sm text-ink/55 mt-1 break-words">{message}</p>
          <button
            type="button"
            onClick={() => { setStatus('idle'); setEmail(''); setMessage(''); }}
            className="text-sm text-accent-dark hover:underline mt-2.5"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`glass rounded-2xl p-6 flex items-start gap-3 border border-emerald-500/25 ${className}`}
      >
        <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-ink/70 min-w-0 break-words">{message}</p>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <h3 className="font-display font-semibold flex items-center gap-2 mb-1">
        <Mail size={16} className="text-accent-dark shrink-0" /> Get notified on new posts
      </h3>
      <p className="text-sm text-ink/50 mb-4">No spam — just an email when something new goes up.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">Your email</label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="you@example.com"
          className="flex-1 min-w-0 input-field px-4 py-2.5 text-sm"
        />
        <Button type="submit" disabled={status === 'loading'} icon={<Send size={15} />}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {status === 'error' && <p role="alert" className="text-sm text-red-400 mt-2">{message}</p>}
    </div>
  );
}
