import { useEffect, useState } from 'react';
import { PortfolioAPI } from '@/services/api';
import { sampleExperience, sampleEducation } from '@/utils/sampleData';
import Timeline from '@/components/sections/Timeline';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function ExperiencePage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Experience', settings));

  const [work, setWork] = useState(sampleExperience);
  const [education, setEducation] = useState(sampleEducation);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [workRes, eduRes] = await Promise.all([
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getExperience('education'),
      ]);
      if (!mounted) return;

      setWork(workRes.data?.length ? workRes.data : sampleExperience);
      setEducation(eduRes.data?.length ? eduRes.data : sampleEducation);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-28 pb-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="section-label">Journey</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Experience &amp; <span className="text-gradient">Education</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-14">
          <Timeline title="Work Experience" items={work} />
          <Timeline title="Education" items={education} />
        </div>
      </div>
    </div>
  );
}
