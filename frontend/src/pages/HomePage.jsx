import { useEffect, useState } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Contacts from '@/components/sections/Contacts';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile, sampleSkills, sampleProjects } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function HomePage() {
  const [profile, setProfile] = useState(sampleProfile);
  const [skills, setSkills] = useState(sampleSkills);
  const [projects, setProjects] = useState(sampleProjects.slice(0, 6));

  // The homepage tab title is the site's "identity" title: prefer the
  // admin-configured Site Title, then fall back to "Name — Role" built
  // from the actual profile data (never the old hardcoded placeholder).
  const settings = useSiteSettings();
  useDocumentTitle(
    settings?.site_title ||
      (profile?.full_name && profile?.title
        ? `${profile.full_name} — ${profile.title}`
        : 'Portfolio')
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
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} />
      <Skills grouped={skills} />
      <Projects projects={projects} />
      <Contacts profile={profile} />
    </>
  );
}
