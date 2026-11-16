import { useCallback, useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import {
  credentialDates, dateRange, displayUrl, skillCategories, splitParagraphs,
} from '@/utils/aboutContent';
import { isRealUrl } from '@/utils/projectContent';

// One column, no cards, no motion: reads the same on screen and on paper.
// The print rules (index.css, "Print") force the light palette in both themes,
// hide the site chrome and keep each entry whole across page breaks.
// `print:` variants are used for the two-column rows because an A4 page is
// narrower than Tailwind's md breakpoint.
const ROW = 'grid gap-1 md:grid-cols-[11rem_1fr] md:gap-8 print:grid-cols-[10.5rem_1fr] print:gap-6';

function Section({ title, children }) {
  return (
    <section className="mt-12 print:mt-7">
      <h2 className="border-b border-line pb-3 font-display text-3xl font-normal tracking-tight print:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function Entries({ items }) {
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {items.map((item, i) => (
        <li key={item.id || i} className={`resume-entry ${ROW} py-5 print:py-3`}>
          <p className="m-0 text-sm text-muted">{dateRange(item)}</p>
          <div>
            <h3 className="font-display text-xl font-normal leading-snug">{item.title}</h3>
            {(item.organization || item.location) && (
              <p className="m-0 text-sm text-muted">{[item.organization, item.location].filter(Boolean).join(' · ')}</p>
            )}
            {item.description && <p className="mt-2 max-w-measure whitespace-pre-line print:max-w-none">{item.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ResumePage() {
  const settings = useSiteSettings();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useDocumentTitle(buildTitle('Resume', settings, data?.profile?.full_name));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getExperience('education'),
        PortfolioAPI.getSkills(),
        PortfolioAPI.getCertificates(),
      ]);
      if (!mounted) return;
      const [profile, work, education, skills, certs] = results;
      if (results.every((r) => r.error)) {
        setFailed(true);
        return;
      }
      setFailed(false);
      setData({
        profile: profile.data || {},
        work: work.data || [],
        education: education.data || [],
        skills: skillCategories(skills.data),
        certs: certs.data || [],
      });
    })();
    return () => { mounted = false; };
  }, [attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setData(null);
    setAttempt((n) => n + 1);
  }, []);

  const p = data?.profile || {};
  const summary = splitParagraphs(p.bio)[0];
  const contact = [
    p.email && { key: 'email', text: p.email, href: `mailto:${p.email}` },
    p.phone && { key: 'phone', text: p.phone, href: `tel:${String(p.phone).replace(/[^\d+]/g, '')}` },
    p.location && { key: 'location', text: p.location },
    isRealUrl(p.website_url) && { key: 'web', text: displayUrl(p.website_url), href: p.website_url },
    isRealUrl(p.github_url) && { key: 'github', text: displayUrl(p.github_url), href: p.github_url },
    isRealUrl(p.linkedin_url) && { key: 'linkedin', text: displayUrl(p.linkedin_url), href: p.linkedin_url },
  ].filter(Boolean);
  const isEmpty = data && !summary && !data.work.length && !data.education.length && !data.skills.length && !data.certs.length;

  return (
    <div className="resume-print-area pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <div className="container-page max-w-3xl">
        {failed && (
          <ErrorState title="Could not load the resume" message="Check your connection and try again." onRetry={retry} />
        )}

        {!failed && !data && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {data && (
          <>
            <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between print:block">
              <div>
                <p className="section-label print:hidden">Resume</p>
                <h1 className="mt-3 font-display text-4xl font-normal leading-tight tracking-tight md:text-5xl print:mt-0">
                  {p.full_name || 'Resume'}
                </h1>
                {p.title && <p className="mt-2 text-lg text-muted">{p.title}</p>}
                {contact.length > 0 && (
                  <ul className="m-0 mt-3 flex list-none flex-wrap items-center gap-x-5 p-0 text-sm print:mt-2">
                    {contact.map((c) => (
                      <li key={c.key}>
                        {c.href ? (
                          <a
                            href={c.href}
                            {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                            className="inline-flex min-h-11 items-center underline decoration-line underline-offset-4 hover:decoration-accent print:min-h-0"
                          >
                            {c.text}
                          </a>
                        ) : (
                          c.text
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-3 print:hidden">
                {isRealUrl(p.resume_url) && (
                  <Button href={p.resume_url} icon={<Download size={16} aria-hidden="true" />}>Download PDF</Button>
                )}
                <Button
                  variant={isRealUrl(p.resume_url) ? 'secondary' : 'primary'}
                  icon={<Printer size={16} aria-hidden="true" />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>
            </header>

            {summary && (
              <Section title="Profile">
                <p className="mt-5 max-w-measure whitespace-pre-line print:mt-3 print:max-w-none">{summary}</p>
              </Section>
            )}

            {data.work.length > 0 && (
              <Section title="Experience"><Entries items={data.work} /></Section>
            )}
            {data.education.length > 0 && (
              <Section title="Education"><Entries items={data.education} /></Section>
            )}

            {data.skills.length > 0 && (
              <Section title="Skills">
                <dl className="m-0 divide-y divide-line">
                  {data.skills.map((category) => (
                    <div key={category.name} className={`resume-entry ${ROW} py-5 print:py-3`}>
                      <dt className="font-display text-lg">{category.name}</dt>
                      <dd className="m-0">{category.skills.map((s) => s.name).join(', ')}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            {data.certs.length > 0 && (
              <Section title="Certificates">
                <ul className="m-0 list-none divide-y divide-line p-0">
                  {data.certs.map((c, i) => (
                    <li key={c.id || i} className={`resume-entry ${ROW} py-4 print:py-2`}>
                      <p className="m-0 text-sm text-muted">{credentialDates(c).replace(/^Issued /, '')}</p>
                      <p className="m-0">
                        <span className="font-display text-lg">{c.title}</span>
                        {c.issuer && <span className="text-muted"> · {c.issuer}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {isEmpty && (
              <EmptyState
                className="mt-12"
                title="Resume details coming soon"
                description="Experience, education and skills will appear here as they are added."
                seed="resume"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
