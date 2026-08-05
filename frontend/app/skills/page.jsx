import Skills from '@/components/sections/Skills';
import { PortfolioAPI } from '@/services/api';
import { sampleSkills } from '@/utils/sampleData';

export const metadata = { title: 'Skills — Portfolio' };

export default async function SkillsPage() {
  const { data } = await PortfolioAPI.getSkills();
  const grouped = data && Object.keys(data).length ? data : sampleSkills;

  return (
    <div className="pt-28">
      <Skills grouped={grouped} />
    </div>
  );
}
