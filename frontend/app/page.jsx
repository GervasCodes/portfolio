import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Contacts from '@/components/sections/Contacts';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile, sampleSkills, sampleProjects } from '@/utils/sampleData';

export default async function HomePage() {
  const [profileRes, skillsRes, projectsRes] = await Promise.all([
    PortfolioAPI.getProfile(),
    PortfolioAPI.getSkills(),
    PortfolioAPI.getFeaturedProjects(6),
  ]);

  const profile = profileRes.data || sampleProfile;
  const skills = skillsRes.data || sampleSkills;
  const projects = (projectsRes.data?.length ? projectsRes.data : sampleProjects).slice(0, 6);

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
