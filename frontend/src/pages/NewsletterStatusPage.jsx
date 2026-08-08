import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

/**
 * Lands on either the confirmation link or the unsubscribe link sent by
 * email (`/newsletter/confirm?token=...` / `/newsletter/unsubscribe?token=...`).
 * Same component for both — only which API call it fires differs.
 */
export default function NewsletterStatusPage() {
  const { pathname } = useLocation();
  const isUnsubscribe = pathname.startsWith('/newsletter/unsubscribe');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const settings = useSiteSettings();
  useDocumentTitle(buildTitle(isUnsubscribe ? 'Unsubscribe' : 'Confirm Subscription', settings));

  const [state, setState] = useState('loading'); // loading | done | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setState('error');
        setMessage('This link is missing its confirmation token.');
        return;
      }
      const { data, error } = isUnsubscribe
        ? await PortfolioAPI.unsubscribeNewsletter(token)
        : await PortfolioAPI.confirmNewsletter(token);
      if (!mounted) return;
      if (error) {
        setState('error');
        setMessage(error);
      } else {
        setState('done');
        setMessage(data?.message || 'All done.');
      }
    })();
    return () => { mounted = false; };
  }, [token, isUnsubscribe]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center pt-28">
      <div className="max-w-sm">
        {state === 'loading' && <Loader2 className="animate-spin mx-auto mb-4 text-white/40" size={32} />}
        {state === 'done' && <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={40} />}
        {state === 'error' && <XCircle className="mx-auto mb-4 text-red-400" size={40} />}

        <h1 className="font-display text-2xl font-bold mb-2">
          {state === 'loading' && 'One moment...'}
          {state === 'done' && (isUnsubscribe ? 'Unsubscribed' : 'Subscription confirmed')}
          {state === 'error' && 'Something went wrong'}
        </h1>
        <p className="text-white/55 mb-8">{message}</p>

        {state !== 'loading' && (
          <Button href="/blog" icon={<Home size={16} />}>Back to the Blog</Button>
        )}
        <p className="mt-6 text-sm">
          <Link to="/" className="text-white/40 hover:text-white">Return to homepage</Link>
        </p>
      </div>
    </div>
  );
}
