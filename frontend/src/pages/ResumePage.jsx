import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Timeline from '@/components/sections/Timeline';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile, sampleExperience, sampleEducation, sampleSkills } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function ResumePage() {
  const [profile, setProfile] = useState(sampleProfile);
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Resume', settings, profile?.full_name));
  const [work, setWork] = useState(sampleExperience);
  const [education, setEducation] = useState(sampleEducation);
  const [skills, setSkills] = useState(sampleSkills);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [profileRes, workRes, eduRes, skillsRes] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getExperience('education'),
        PortfolioAPI.getSkills(),
      ]);
      if (!mounted) return;

      // Same reasoning as ExperiencePage: only substitute placeholder
      // sample content for a genuinely empty, successful response — not
      // for a failed request, which previously looked identical and made
      // real edits appear to "revert" to old placeholder text.
      if (profileRes.data) setProfile(profileRes.data);
      else if (!profileRes.error) setProfile(sampleProfile);
      else console.error('Failed to load profile:', profileRes.error);

      if (workRes.data?.length) setWork(workRes.data);
      else if (!workRes.error) setWork(sampleExperience);
      else console.error('Failed to load work experience:', workRes.error);

      if (eduRes.data?.length) setEducation(eduRes.data);
      else if (!eduRes.error) setEducation(sampleEducation);
      else console.error('Failed to load education:', eduRes.error);

      if (skillsRes.data && Object.keys(skillsRes.data).length) setSkills(skillsRes.data);
      else if (!skillsRes.error) setSkills(sampleSkills);
      else console.error('Failed to load skills:', skillsRes.error);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-28 pb-24">
      <div className="container-page max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14">
          <div>
            <p className="section-label">Resume</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{profile.full_name}</h1>
            <p className="text-white/55 mt-2">{profile.title}</p>
          </div>
          {profile.resume_url && (
            <Button href={profile.resume_url} icon={<Download size={16} />}>Download PDF</Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-14 mb-14">
          <Timeline title="Work Experience" items={work} />
          <Timeline title="Education" items={education} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span key={skill.id || skill.name} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
