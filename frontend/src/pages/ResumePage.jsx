import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Tag from '@/components/ui/Tag';
import Skeleton from '@/components/ui/Skeleton';
import Timeline from '@/components/sections/Timeline';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function ResumePage() {
  const settings = useSiteSettings();
  const [data, setData] = useState(null);
  useDocumentTitle(buildTitle('Resume', settings, data?.profile?.full_name));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [profile, work, education, skills] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getExperience('education'),
        PortfolioAPI.getSkills(),
      ]);
      if (!mounted) return;
      setData({
        profile: profile.data || {},
        work: work.data || [],
        education: education.data || [],
        skills: skills.data || {},
      });
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pb-24 resume-print-area" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <div className="container-page max-w-3xl">
        {!data ? (
          <div className="space-y-4"><Skeleton className="h-12 w-1/2" /><Skeleton className="h-48 w-full" /></div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="section-label">Resume</p>
                <h1 className="font-display text-4xl md:text-5xl font-normal leading-tight tracking-tight">
                  {data.profile.full_name || 'Resume'}
                </h1>
                {data.profile.title && <p className="text-muted mt-2">{data.profile.title}</p>}
              </div>
              {data.profile.resume_url && (
                <div className="print:hidden">
                  <Button href={data.profile.resume_url} icon={<Download size={16} />}>Download PDF</Button>
                </div>
              )}
            </div>

            <Timeline bare title="Experience" items={data.work} />
            <Timeline bare title="Education" items={data.education} />

            {Object.keys(data.skills).length > 0 && (
              <section>
                <h2 className="font-display text-3xl font-normal tracking-tight mb-8">Skills</h2>
                <dl className="divide-y divide-line border-y border-line">
                  {Object.entries(data.skills).map(([category, items]) => (
                    <div key={category} className="grid gap-3 py-5 md:grid-cols-[1fr_3fr] md:gap-10">
                      <dt className="font-display text-lg">{category}</dt>
                      <dd className="m-0 flex flex-wrap gap-2">
                        {items.map((skill) => <Tag key={skill.id || skill.name}>{skill.name}</Tag>)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
