import { useEffect, useState } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Contacts from '@/components/sections/Contacts';
import CertificatesAchievements from '@/components/sections/CertificatesAchievements';
import { HeroSkeleton, SkillsSkeleton, ProjectsSkeleton } from '@/components/sections/HomeSkeletons';
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
  // Certificates/achievements double as the homepage's social-proof
  // section — credibility signals a first-time visitor sees before
  // reaching Projects, not just on the About page. No sample-data
  // fallback here (unlike profile/skills/projects): an empty result is a
  // legitimate "nothing added yet" state, and CertificatesAchievements
  // already renders nothing when both arrays are empty.
  const [certs, setCerts] = useState([]);
  const [achievements, setAchievements] = useState([]);
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
      const [profileRes, skillsRes, projectsRes, certsRes, achievementsRes] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getSkills(),
        PortfolioAPI.getFeaturedProjects(6),
        PortfolioAPI.getCertificates(),
        PortfolioAPI.getAchievements(),
      ]);
      if (!mounted) return;

      setProfile(profileRes.data || sampleProfile);
      setSkills(skillsRes.data || sampleSkills);
      setProjects((projectsRes.data?.length ? projectsRes.data : sampleProjects).slice(0, 6));
      setCerts(certsRes.data || []);
      setAchievements(achievementsRes.data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Seo
        title={siteTitle}
        description={description}
        path="/"
        image={resolveImage(profile?.avatar_url)}
        siteName={settings?.site_title || profile?.full_name}
      />
      {/* Render the page shell immediately with skeleton placeholders per
          section instead of blocking the whole page behind a spinner —
          gives visitors something to look at right away and avoids the
          "blank, then everything pops in at once" feeling. */}
      {loading ? <HeroSkeleton /> : <Hero profile={profile} />}
      {!loading && <About profile={profile} />}
      {loading ? <SkillsSkeleton /> : <Skills grouped={skills} />}
      {!loading && <CertificatesAchievements certificates={certs} achievements={achievements} />}
      {loading ? <ProjectsSkeleton /> : <Projects projects={projects} />}
      {!loading && <Contacts profile={profile} />}
    </>
  );
}
