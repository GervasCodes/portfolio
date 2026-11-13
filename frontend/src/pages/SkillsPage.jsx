import { useEffect, useState } from 'react';
import Skills from '@/components/sections/Skills';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function SkillsPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Skills', settings));

  const [grouped, setGrouped] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getSkills();
      if (mounted) setGrouped(data || {});
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-h) + 2rem)' }}>
      {grouped === null && <div className="container-page"><Skeleton className="h-48 w-full" /></div>}
      {grouped && Object.keys(grouped).length > 0 && <Skills grouped={grouped} />}
      {grouped && Object.keys(grouped).length === 0 && (
        <div className="container-page">
          <EmptyState title="No skills added yet" description="Skills are managed in the admin area." />
        </div>
      )}
    </div>
  );
}
