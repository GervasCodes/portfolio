import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

/**
 * Lands on either the confirmation link or the unsubscribe link sent by
 * email (`/newsletter/confirm?token=...` / `/newsletter/unsubscribe?token=...`).
 * One component for both; only the API call and the words differ. The result
 * is announced to screen readers and focus moves to the heading when it arrives.
 */
export default function NewsletterStatusPage() {
  const { pathname } = useLocation();
  const isUnsubscribe = pathname.startsWith('/newsletter/unsubscribe');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const settings = useSiteSettings();
  const headingRef = useRef(null);
  const [state, setState] = useState('loading'); // loading | done | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    setState('loading');
    (async () => {
      if (!token) {
        setState('error');
        setMessage('This link is missing its token. Open the link from your email again, or copy the whole address.');
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

  useEffect(() => {
    if (state !== 'loading') headingRef.current?.focus();
  }, [state]);

  const title = {
    loading: 'One moment…',
    done: isUnsubscribe ? 'You are unsubscribed' : 'Subscription confirmed',
    error: 'That did not work',
  }[state];
  const Icon = state === 'done' ? CheckCircle2 : state === 'error' ? XCircle : Loader2;
  const tone = state === 'done' ? 'text-success' : state === 'error' ? 'text-danger' : 'text-muted';

  return (
    <div className="flex min-h-[70vh] items-center pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo title={buildTitle(isUnsubscribe ? 'Unsubscribe' : 'Confirm subscription', settings)} noindex />
      <div className="container-page">
        <Card spotlight={false} raised className="mx-auto max-w-xl p-8 text-center md:p-12">
          <Icon size={44} aria-hidden="true" className={`mx-auto ${tone} ${state === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`} />
          <h1 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-3xl font-normal leading-tight tracking-tight outline-none md:text-4xl">
            {title}
          </h1>
          <p role="status" aria-live="polite" className="mt-4 text-muted">{state === 'loading' ? '' : message}</p>

          {state !== 'loading' && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/blog">{state === 'done' && !isUnsubscribe ? 'Read the writing' : 'Back to the writing'}</Button>
              <Button href="/" variant="ghost">Go to the homepage</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
