import { useEffect, useState } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Contacts from '@/components/sections/Contacts';
import PageLoader from '@/components/layout/PageLoader';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile, sampleSkills, sampleProjects } from '@/utils/sampleData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { truncate, resolveImage } from '@/utils/seo';

export default function HomePage() {
  // Start empty (not the sample placeholders) so the real data never
  // gets a flash of sample content in front of it while the DB loads.
  // The sample content is only used as a genuine fallback, after the
  // API call has resolved with nothing.
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(null);
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);

  // The homepage tab title is the site's "identity" title: prefer the
  // admin-configured Site Title, then fall back to "Name — Role" built
  // from the actual profile data (never the old hardcoded placeholder).
  const settings = useSiteSettings();
  const siteTitle =
    settings?.site_title ||
    (profile?.full_name && profile?.title ? `${profile.full_name} — ${profile.title}` : 'Portfolio');
  const description = truncate(
    settings?.site_description || profile?.tagline || profile?.bio || 'Full-stack developer portfolio and personal CMS.'
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [profileRes, skillsRes, projectsRes] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getSkills(),
        PortfolioAPI.getFeaturedProjects(6),
      ]);
      if (!mounted) return;

      setProfile(profileRes.data || sampleProfile);
      setSkills(skillsRes.data || sampleSkills);
      setProjects((projectsRes.data?.length ? projectsRes.data : sampleProjects).slice(0, 6));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      <Seo
        title={siteTitle}
        description={description}
        path="/"
        image={resolveImage(profile?.avatar_url)}
        siteName={settings?.site_title || profile?.full_name}
      />
      <Hero profile={profile} />
      <About profile={profile} />
      <Skills grouped={skills} />
      <Projects projects={projects} />
      <Contacts profile={profile} />
    </>
  );
}
