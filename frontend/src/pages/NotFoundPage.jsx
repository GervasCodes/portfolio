import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import TextLink from '@/components/ui/TextLink';

export default function NotFoundPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Page not found', settings));

  return (
    <div className="container-page" style={{ paddingTop: 'calc(var(--navbar-h) + 4rem)' }}>
      <p className="text-sm text-muted">Error 404</p>
      <h1 className="font-display text-5xl font-semibold mt-2 max-w-xl">This page doesn&apos;t exist.</h1>
      <p className="text-muted mt-4 max-w-prose">
        The link may be old or mistyped. Try one of these instead:
      </p>
      <ul className="mt-6 space-y-2">
        <li><TextLink href="/projects">See the work</TextLink></li>
        <li><TextLink href="/about">Read about me</TextLink></li>
        <li><TextLink href="/contact">Get in touch</TextLink></li>
        <li><TextLink href="/search">Search the site</TextLink></li>
      </ul>
      <p className="mt-8 text-sm"><Link to="/" className="text-muted hover:text-ink">← Back to home</Link></p>
    </div>
  );
}
