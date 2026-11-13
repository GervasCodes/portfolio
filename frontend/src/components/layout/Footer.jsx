import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { usePostCount } from '@/hooks/usePostCount';

/** Turns a stored phone number into a wa.me link, tolerating spaces/dashes/+. */
function toWhatsAppUrl(number) {
  const digits = String(number || '').replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

// Contact details come only from Admin → Profile. A link with no real
// value is simply not shown (no placeholder URLs).
export default function Footer() {
  const profile = useProfile();
  const postCount = usePostCount();
  const year = new Date().getFullYear();

  const external = [
    { label: 'GitHub', href: profile?.github_url },
    { label: 'LinkedIn', href: profile?.linkedin_url },
    { label: 'Instagram', href: profile?.instagram_url },
    { label: 'WhatsApp', href: toWhatsAppUrl(profile?.whatsapp_number) },
    { label: 'Email', href: profile?.email ? `mailto:${profile.email}` : null },
  ].filter((l) => l.href);

  const site = [
    { label: 'Work', to: '/projects' },
    { label: 'About', to: '/about' },
    ...((postCount ?? 0) >= 3 ? [{ label: 'Writing', to: '/blog' }] : []),
    { label: 'Resume', to: '/resume' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <footer className="mt-32 border-t border-line">
      <div className="container-page py-10 grid gap-8 md:grid-cols-[1fr_auto_auto] md:gap-16">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Gerry&apos;s Portfolio</p>
          <p className="text-sm text-muted mt-1">© {year}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="space-y-2 text-sm">
            {site.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted hover:text-ink">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {external.length > 0 && (
          <ul className="space-y-2 text-sm" aria-label="Elsewhere">
            {external.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-muted hover:text-ink"
                  {...(l.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' })}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="container-page pb-8 text-xs text-muted">
        <Link to="/admin/login" className="hover:text-ink">Admin</Link>
      </div>
    </footer>
  );
}
