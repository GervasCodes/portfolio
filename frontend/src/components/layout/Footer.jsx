import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { useProfile } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavLinks } from '@/hooks/useNavLinks';
import { useLocalTime } from '@/hooks/useLocalTime';
import { copyText } from '@/utils/clipboard';

/** Turns a stored phone number into a wa.me link, tolerating spaces/dashes/+. */
function toWhatsAppUrl(number) {
  const digits = String(number || '').replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

// Wordmark size: fit the name on one line at any length. Instrument Serif is
// ~0.42em per character; the container is at most ~1180 px wide.
function wordmarkSize(text) {
  const len = Math.max(String(text).length, 4);
  const vw = Math.min(20, 200 / len);
  const px = Math.min(260, 2740 / len);
  return `min(${vw.toFixed(2)}vw, ${px.toFixed(0)}px)`;
}

/**
 * Footer: closing email CTA, site + social links, local time, and a big
 * gradient wordmark (the footer wordmark is one of the three places the
 * accent gradient is allowed). Everything comes from Admin → Profile; a value
 * that isn't set is simply not shown.
 */
export default function Footer() {
  const profile = useProfile();
  const settings = useSiteSettings();
  const links = useNavLinks();
  const time = useLocalTime();
  const [copied, setCopied] = useState(false);
  const year = new Date().getFullYear();

  const name = profile?.full_name || settings?.site_title || '';
  const email = profile?.email || '';

  const external = [
    { label: 'GitHub', href: profile?.github_url },
    { label: 'LinkedIn', href: profile?.linkedin_url },
    { label: 'Instagram', href: profile?.instagram_url },
    { label: 'WhatsApp', href: toWhatsAppUrl(profile?.whatsapp_number) },
  ].filter((l) => l.href);

  const onCopy = async () => {
    if (await copyText(email)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer className="grain relative mt-32 overflow-hidden border-t border-line">
      <div className="container-page relative z-[2] pt-20 md:pt-28">
        <div className="grid gap-10 md:grid-cols-[1.25fr_1fr] md:items-end">
          <div>
            <p className="section-label">Let’s talk</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight md:text-6xl">
              Have a <em>project</em> in mind?
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4">
            {email ? (
              <>
                <a
                  href={`mailto:${email}`}
                  className="group inline-flex min-h-11 max-w-full items-center gap-2 break-all font-display text-2xl text-ink underline decoration-accent decoration-2 underline-offset-8 transition-colors duration-fast hover:text-accent sm:text-3xl"
                >
                  {email}
                  <ArrowUpRight size={22} aria-hidden="true" className="shrink-0 transition-transform duration-base ease-standard group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <div className="flex flex-wrap items-center gap-3">
                  <Button href={`mailto:${email}`}>Start a project</Button>
                  <Button
                    variant="secondary"
                    onClick={onCopy}
                    icon={copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  >
                    {copied ? 'Copied' : 'Copy email'}
                  </Button>
                  <span className="sr-only" role="status">{copied ? 'Email address copied to clipboard' : ''}</span>
                </div>
              </>
            ) : (
              <Button href="/contact">Start a project</Button>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-line pt-10 sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto]">
          <nav aria-label="Footer">
            <p className="section-label mb-4">Site</p>
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="inline-flex min-h-11 items-center text-muted transition-colors duration-fast hover:text-ink">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {external.length > 0 && (
            <div>
              <p className="section-label mb-4">Elsewhere</p>
              <ul className="space-y-1">
                {external.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1 text-muted transition-colors duration-fast hover:text-ink"
                    >
                      {l.label}
                      <ArrowUpRight size={14} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="section-label mb-4">Based in</p>
            {profile?.location && <p className="text-ink">{profile.location}</p>}
            {time && (
              <p className="mt-1 font-mono text-sm text-muted">
                <time>{time}</time> EAT
              </p>
            )}
            {profile?.available_for_work && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
                Available for new projects
              </p>
            )}
          </div>
        </div>
      </div>

      {name && (
        <p
          aria-hidden="true"
          className="wordmark relative z-[2] mx-auto mt-16 max-w-page select-none overflow-hidden whitespace-nowrap px-gutter text-center"
          style={{ fontSize: wordmarkSize(name), paddingBottom: '0.14em' }}
        >
          {name}
        </p>
      )}

      <div className="container-page relative z-[2] flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pb-8 pt-4 text-xs text-muted">
        <p>© {year}{name ? ` ${name}` : ''}</p>
        <Link to="/admin/login" className="inline-flex min-h-11 items-center hover:text-ink">Admin</Link>
      </div>
    </footer>
  );
}
