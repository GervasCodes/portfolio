import { useEffect, useState } from 'react';
import Skills from '@/components/sections/Skills';
import { PortfolioAPI } from '@/services/api';
import { sampleSkills } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function SkillsPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Skills', settings));

  const [grouped, setGrouped] = useState(sampleSkills);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getSkills();
      if (!mounted) return;
      setGrouped(data && Object.keys(data).length ? data : sampleSkills);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-28">
      <Skills grouped={grouped} />
    </div>
  );
}
