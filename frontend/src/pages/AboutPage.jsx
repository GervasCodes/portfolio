import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import About from '@/components/sections/About';
import ExperienceSection from '@/components/sections/Timeline';
import Skills from '@/components/sections/Skills';
import CertificatesAchievements from '@/components/sections/CertificatesAchievements';
import Button from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Reveal from '@/components/ui/Reveal';
import Skeleton from '@/components/ui/Skeleton';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, resolveImage } from '@/utils/seo';
import { sectionNumbers, skillCategories, skillNames } from '@/utils/aboutContent';
import { isRealUrl } from '@/utils/projectContent';

// About (Phase 5) is the single home for the story, skills, experience,
// education and credentials (the old /skills and /experience pages redirect
// here: #skills and #experience still land on the right section).
// Everything shown comes from the CMS. A section with no data is left out;
// if every section is empty a designed empty state is shown instead.
export default function AboutPage() {
  const { hash } = useLocation();
  const settings = useSiteSettings();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getExperience('education'),
        PortfolioAPI.getSkills(),
        PortfolioAPI.getCertificates(),
        PortfolioAPI.getAchievements(),
      ]);
      if (!mounted) return;
      const [profile, work, education, skills, certs, achievements] = results;
      // Only a total failure (every request errored, e.g. offline) is an error
      // screen; a single failed list just leaves its section out.
      if (results.every((r) => r.error)) {
        setFailed(true);
        return;
      }
      setFailed(false);
      setData({
        profile: profile.data || null,
        work: work.data || [],
        education: education.data || [],
        skills: skills.data || {},
        certs: certs.data || [],
        achievements: achievements.data || [],
      });
    })();
    return () => { mounted = false; };
  }, [attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setData(null);
    setAttempt((n) => n + 1);
  }, []);

  // Jump to #skills / #experience / #education / #recognition once the sections exist.
  useEffect(() => {
    if (data && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [data, hash]);

  const profile = data?.profile;
  const categories = skillCategories(data?.skills);
  const hasExperience = Boolean(data && (data.work.length || data.education.length));
  const hasRecognition = Boolean(data && (data.certs.length || data.achievements.length));
  const numbers = sectionNumbers([
    categories.length > 0 && 'skills',
    hasExperience && 'experience',
    hasRecognition && 'recognition',
  ]);
  const jump = [
    categories.length > 0 && { id: 'skills', label: 'Skills' },
    data?.work.length > 0 && { id: 'experience', label: 'Experience' },
    data?.education.length > 0 && { id: 'education', label: 'Education' },
    hasRecognition && { id: 'recognition', label: 'Recognition' },
  ].filter(Boolean);

  const description = truncate(profile?.bio || profile?.tagline || '');
  const image = resolveImage(profile?.avatar_url);
  const sameAs = [profile?.github_url, profile?.linkedin_url, profile?.twitter_url, profile?.instagram_url, profile?.website_url]
    .filter(Boolean);
  const knowsAbout = skillNames(categories);
  const structuredData = profile?.full_name
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.full_name,
        jobTitle: profile.title || undefined,
        description: description || undefined,
        url: absoluteUrl('/about'),
        ...(image ? { image } : {}),
        ...(profile.email ? { email: profile.email } : {}),
        ...(profile.location ? { address: profile.location } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(knowsAbout.length ? { knowsAbout } : {}),
      }
    : undefined;

  const hasResumeFile = isRealUrl(profile?.resume_url);

  return (
    <div className="pb-8" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo
        title={buildTitle('About', settings, profile?.full_name)}
        description={description}
        path="/about"
        image={image}
        siteName={settings?.site_title || profile?.full_name}
        structuredData={structuredData}
      />

      {failed && (
        <div className="container-page">
          <ErrorState
            title="Could not load this page"
            message="Check your connection and try again."
            onRetry={retry}
          />
        </div>
      )}

      {!failed && !data && (
        <div className="container-page grid gap-12 pb-16 lg:grid-cols-12" aria-busy="true" aria-label="Loading">
          <div className="space-y-5 lg:col-span-7">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-3/4 md:h-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="mx-auto aspect-[4/5] w-full max-w-xs rounded-3xl sm:max-w-sm lg:col-span-5 lg:max-w-md lg:justify-self-end" />
        </div>
      )}

      {data && (
        <>
          <About profile={profile} jump={jump} />
          <Skills grouped={data.skills} number={numbers.skills} />
          <ExperienceSection work={data.work} education={data.education} number={numbers.experience} />
          <CertificatesAchievements certificates={data.certs} achievements={data.achievements} number={numbers.recognition} />

          {!categories.length && !hasExperience && !hasRecognition && (
            <div className="container-page pb-16">
              <EmptyState
                title="More on the way"
                description="Skills, experience and credentials will appear here as they are added."
                seed="about"
              />
            </div>
          )}

          <section aria-labelledby="resume-cta-title" className="pb-12 pt-8 md:pb-16">
            <div className="container-page">
              <Reveal>
                <Card raised spotlight={false} className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
                  <div>
                    <h2 id="resume-cta-title" className="font-display text-3xl font-normal leading-tight tracking-tight md:text-4xl">
                      The details, <em>on paper</em>
                    </h2>
                    <p className="mt-3 max-w-measure text-muted">
                      Experience, education and skills in a clean layout that prints well.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {hasResumeFile && (
                      <Button href={profile.resume_url} size="lg" icon={<Download size={16} aria-hidden="true" />}>
                        Download PDF
                      </Button>
                    )}
                    <Button
                      href="/resume"
                      variant={hasResumeFile ? 'secondary' : 'primary'}
                      size="lg"
                      icon={<FileText size={16} aria-hidden="true" />}
                    >
                      Open printable resume
                    </Button>
                  </div>
                </Card>
              </Reveal>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
