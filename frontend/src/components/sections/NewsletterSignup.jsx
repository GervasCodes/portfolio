import { useState } from 'react';
import { Mail, Send, CheckCircle2, Info } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { PortfolioAPI } from '@/services/api';

/**
 * "Notify me on new posts" signup. Double opt-in, so submitting only asks the
 * visitor to check their inbox. Three outcomes, deliberately different so a
 * returning visitor is not told to check an inbox that will never get anything:
 *  - new / re-subscribing -> "check your inbox"
 *  - already confirmed    -> "this email is already on the list"
 *  - failure              -> inline error, the form stays filled in
 * Used on the Writing pages; small enough to drop anywhere (the footer too).
 */
export default function NewsletterSignup({ className = '' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | exists | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus('loading');
    const { data, error } = await PortfolioAPI.subscribeNewsletter(value);
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

  if (status === 'exists' || status === 'done') {
    const exists = status === 'exists';
    const Icon = exists ? Info : CheckCircle2;
    return (
      <Card spotlight={false} raised className={`p-6 md:p-8 ${className}`}>
        <div role="status" aria-live="polite" className="flex items-start gap-4">
          <Icon className={`mt-1 shrink-0 ${exists ? 'text-warning' : 'text-success'}`} size={22} aria-hidden="true" />
          <div className="min-w-0">
            <p className="m-0 font-display text-2xl font-normal leading-tight tracking-tight">
              {exists ? 'You are already on the list' : 'Check your inbox'}
            </p>
            <p className="mt-2 break-words text-muted">{message}</p>
            {exists && (
              <button
                type="button"
                onClick={() => { setStatus('idle'); setEmail(''); setMessage(''); }}
                className="mt-2 inline-flex min-h-11 items-center text-sm text-accent hover:underline"
              >
                Use a different email
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card spotlight={false} raised className={`p-6 md:p-8 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
        <div>
          <h2 className="m-0 flex items-center gap-3 font-display text-2xl font-normal leading-tight tracking-tight md:text-3xl">
            <Mail size={20} aria-hidden="true" className="shrink-0 text-accent" />
            Get an email when I <em>publish</em>
          </h2>
          <p className="mt-3 text-muted">No spam. One email when something new goes up, and an unsubscribe link in each.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">Your email</label>
          <Input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            aria-invalid={status === 'error' ? true : undefined}
            aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="you@example.com"
            className="min-w-0 flex-1"
          />
          <Button type="submit" loading={status === 'loading'} icon={<Send size={15} aria-hidden="true" />}>
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      </div>
      {status === 'error' && <p id="newsletter-error" role="alert" className="mt-3 text-sm text-danger">{message}</p>}
    </Card>
  );
}
