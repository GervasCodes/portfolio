import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import About from '@/components/sections/About';
import Timeline from '@/components/sections/Timeline';
import Skills from '@/components/sections/Skills';
import CertificatesAchievements from '@/components/sections/CertificatesAchievements';
import Skeleton from '@/components/ui/Skeleton';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, resolveImage } from '@/utils/seo';

// About is the single home for profile, experience, education, skills and
// credentials (the old /skills and /experience pages redirect here).
export default function AboutPage() {
  const { hash } = useLocation();
  const settings = useSiteSettings();
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [profile, work, education, skills, certs, achievements] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getExperience('education'),
        PortfolioAPI.getSkills(),
        PortfolioAPI.getCertificates(),
        PortfolioAPI.getAchievements(),
      ]);
      if (!mounted) return;
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
  }, []);

  // Jump to #skills / #experience once the sections exist.
  useEffect(() => {
    if (data && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [data, hash]);

  const profile = data?.profile;
  const description = truncate(profile?.bio || profile?.tagline || '');
  const image = resolveImage(profile?.avatar_url);
  const sameAs = [profile?.github_url, profile?.linkedin_url, profile?.twitter_url, profile?.instagram_url, profile?.website_url]
    .filter(Boolean);
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
      }
    : undefined;

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
      {!data ? (
        <div className="container-page space-y-4"><Skeleton className="h-12 w-1/2" /><Skeleton className="h-32 w-full" /></div>
      ) : (
        <>
          <About profile={profile} />
          <Timeline id="experience" title="Experience" items={data.work} />
          <Timeline id="education" title="Education" items={data.education} />
          <Skills grouped={data.skills} />
          <CertificatesAchievements certificates={data.certs} achievements={data.achievements} />
        </>
      )}
    </div>
  );
}
