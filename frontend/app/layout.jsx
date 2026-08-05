import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/layout/SiteChrome';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata = {
  title: 'Your Name — Software Engineer',
  description: 'Full-stack developer portfolio and personal CMS.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
