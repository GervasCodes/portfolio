import About from '@/components/sections/About';
import CertificatesAchievements from '@/components/sections/CertificatesAchievements';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile } from '@/utils/sampleData';

export const metadata = { title: 'About — Portfolio' };

export default async function AboutPage() {
  const [profileRes, certsRes, achievementsRes] = await Promise.all([
    PortfolioAPI.getProfile(),
    PortfolioAPI.getCertificates(),
    PortfolioAPI.getAchievements(),
  ]);

  const profile = profileRes.data || sampleProfile;

  return (
    <div className="pt-28">
      <About profile={profile} />
      <CertificatesAchievements
        certificates={certsRes.data || []}
        achievements={achievementsRes.data || []}
      />
    </div>
  );
}
