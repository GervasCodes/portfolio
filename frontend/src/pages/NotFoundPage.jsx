import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function NotFoundPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Page Not Found', settings));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center pt-28">
      <div>
        <p className="font-display text-7xl font-bold text-gradient mb-4">404</p>
        <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-white/55 mb-8">The page you're looking for doesn't exist or has moved.</p>
        <Button href="/" icon={<Home size={16} />}>
          Back to Home
        </Button>
        <p className="mt-6 text-sm">
          <Link to="/" className="text-white/40 hover:text-white">Return to homepage</Link>
        </p>
      </div>
    </div>
  );
}
