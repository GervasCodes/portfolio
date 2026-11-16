import { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SkipToContent from './SkipToContent';
import ScrollProgress from './ScrollProgress';
import { CommandPaletteProvider, useCommandPalette } from '@/hooks/useCommandPalette';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// The palette is downloaded the first time it is opened, not with the home page.
const CommandPalette = lazyWithRetry(() => import('./CommandPalette'));

function PaletteHost() {
  const { open } = useCommandPalette();
  const [everOpened, setEverOpened] = useState(false);
  useEffect(() => { if (open) setEverOpened(true); }, [open]);
  if (!everOpened) return null;
  return (
    <Suspense fallback={null}>
      <CommandPalette />
    </Suspense>
  );
}

/**
 * The public chrome (floating navbar, scroll progress, footer, command
 * palette) doesn't belong on admin screens, which have their own
 * Sidebar-driven layout, so this wrapper hides it there.
 */
export default function SiteChrome({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        <SkipToContent />
        <main id="main-content" tabIndex={-1} className="min-h-screen bg-background focus:outline-none">{children}</main>
      </>
    );
  }

  return (
    <CommandPaletteProvider>
      <SkipToContent />
      <ScrollProgress />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">{children}</main>
      <Footer />
      <PaletteHost />
    </CommandPaletteProvider>
  );
}
