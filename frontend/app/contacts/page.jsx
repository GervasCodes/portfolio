import Contacts from '@/components/sections/Contacts';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile } from '@/utils/sampleData';

export const metadata = { title: 'Contact — Portfolio' };

export default async function ContactsPage() {
  const { data } = await PortfolioAPI.getProfile();
  const profile = data || sampleProfile;

  return (
    <div className="pt-28">
      <Contacts profile={profile} />
    </div>
  );
}
