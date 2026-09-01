import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SkipToContent from './SkipToContent';

/**
 * The public Navbar/Footer don't belong on admin screens (which have
 * their own Sidebar-driven layout), so this wrapper hides them there.
 */
export default function SiteChrome({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        <SkipToContent />
        <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">{children}</main>
      </>
    );
  }

  return (
    <>
      <SkipToContent />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
