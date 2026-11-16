import { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SiteChrome from '@/components/layout/SiteChrome';
import ScrollToTop from '@/components/layout/ScrollToTop';
import PageViewTracker from '@/components/layout/PageViewTracker';
import PageLoader from '@/components/layout/PageLoader';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Every route is loaded on demand instead of being bundled into the
// initial JS payload. This is what actually fixes the "chunk larger
// than 500kB" warning: react-markdown, and the entire admin
// dashboard (which most visitors never open) get their own chunks
// that only download when that route is visited.
//
// lazyWithRetry (instead of React.lazy) auto-recovers when a chunk
// 404s because a new deploy shipped after the visitor's tab/cache
// picked up the previous build's index.html — see utils/lazyWithRetry.js.
const HomePage = lazyWithRetry(() => import('@/pages/HomePage'));
const AboutPage = lazyWithRetry(() => import('@/pages/AboutPage'));
const ProjectsPage = lazyWithRetry(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazyWithRetry(() => import('@/pages/ProjectDetailPage'));
const BlogPage = lazyWithRetry(() => import('@/pages/BlogPage'));
const BlogDetailPage = lazyWithRetry(() => import('@/pages/BlogDetailPage'));
const ResumePage = lazyWithRetry(() => import('@/pages/ResumePage'));
const ContactsPage = lazyWithRetry(() => import('@/pages/ContactsPage'));
const SearchPage = lazyWithRetry(() => import('@/pages/SearchPage'));
const NewsletterStatusPage = lazyWithRetry(() => import('@/pages/NewsletterStatusPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage'));

// Developer-only component gallery. Vite replaces import.meta.env.DEV with
// `false` in production builds, so this import (and the page) never ships.
const StyleguidePage = import.meta.env.DEV
  ? lazyWithRetry(() => import('@/pages/dev/StyleguidePage'))
  : null;

const AdminLoginPage = lazyWithRetry(() => import('@/pages/admin/AdminLoginPage'));
const AdminProfilePage = lazyWithRetry(() => import('@/pages/admin/AdminProfilePage'));
const AdminSkillsPage = lazyWithRetry(() => import('@/pages/admin/AdminSkillsPage'));
const AdminExperiencePage = lazyWithRetry(() => import('@/pages/admin/AdminExperiencePage'));
const AdminProjectsPage = lazyWithRetry(() => import('@/pages/admin/AdminProjectsPage'));
const AdminBlogPage = lazyWithRetry(() => import('@/pages/admin/AdminBlogPage'));
const AdminCertificatesPage = lazyWithRetry(() => import('@/pages/admin/AdminCertificatesPage'));
const AdminAchievementsPage = lazyWithRetry(() => import('@/pages/admin/AdminAchievementsPage'));
const AdminSubscribersPage = lazyWithRetry(() => import('@/pages/admin/AdminSubscribersPage'));
const AdminSettingsPage = lazyWithRetry(() => import('@/pages/admin/AdminSettingsPage'));

export default function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  // Page transition: a short fade + 12 px rise on enter, a quicker fade on exit.
  // Skipped entirely for prefers-reduced-motion (a clean static page swap).
  const pageMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } },
      };

  return (
    <SiteChrome>
      <ScrollToTop />
      <PageViewTracker />
      <Suspense fallback={<PageLoader />}>
        {/* mode="wait" finishes the outgoing page's fade-out before the incoming
            one enters, so the two never overlap. The scroll position resets once
            the old page is gone, so it never visibly jumps. */}
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div
            key={location.pathname}
            {...pageMotion}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/skills" element={<Navigate to="/about#skills" replace />} />
              <Route path="/experience" element={<Navigate to="/about#experience" replace />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/resume" element={<ResumePage />} />
              {/* Old URLs keep working: /profile and /contacts moved. */}
              <Route path="/profile" element={<Navigate to="/about" replace />} />
              <Route path="/contact" element={<ContactsPage />} />
              <Route path="/contacts" element={<Navigate to="/contact" replace />} />
              <Route path="/search" element={<SearchPage />} />
              {StyleguidePage && <Route path="/dev/styleguide" element={<StyleguidePage />} />}
              <Route path="/newsletter/confirm" element={<NewsletterStatusPage />} />
              <Route path="/newsletter/unsubscribe" element={<NewsletterStatusPage />} />

              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/profile" element={<AdminProfilePage />} />
              <Route path="/admin/skills" element={<AdminSkillsPage />} />
              <Route path="/admin/experience" element={<AdminExperiencePage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
              <Route path="/admin/blog" element={<AdminBlogPage />} />
              <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
              <Route path="/admin/achievements" element={<AdminAchievementsPage />} />
              <Route path="/admin/subscribers" element={<AdminSubscribersPage />} />
              <Route path="/admin/setting" element={<AdminSettingsPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </SiteChrome>
  );
}
