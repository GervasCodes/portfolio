import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteChrome from '@/components/layout/SiteChrome';
import ScrollToTop from '@/components/layout/ScrollToTop';
import PageViewTracker from '@/components/layout/PageViewTracker';
import PageLoader from '@/components/layout/PageLoader';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Every route is loaded on demand instead of being bundled into the
// initial JS payload. This is what actually fixes the "chunk larger
// than 500kB" warning: recharts, react-markdown, and the entire admin
// dashboard (which most visitors never open) get their own chunks
// that only download when that route is visited.
//
// lazyWithRetry (instead of React.lazy) auto-recovers when a chunk
// 404s because a new deploy shipped after the visitor's tab/cache
// picked up the previous build's index.html — see utils/lazyWithRetry.js.
const HomePage = lazyWithRetry(() => import('@/pages/HomePage'));
const AboutPage = lazyWithRetry(() => import('@/pages/AboutPage'));
const SkillsPage = lazyWithRetry(() => import('@/pages/SkillsPage'));
const ExperiencePage = lazyWithRetry(() => import('@/pages/ExperiencePage'));
const ProjectsPage = lazyWithRetry(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazyWithRetry(() => import('@/pages/ProjectDetailPage'));
const BlogPage = lazyWithRetry(() => import('@/pages/BlogPage'));
const BlogDetailPage = lazyWithRetry(() => import('@/pages/BlogDetailPage'));
const ResumePage = lazyWithRetry(() => import('@/pages/ResumePage'));
const ProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage'));
const ContactsPage = lazyWithRetry(() => import('@/pages/ContactsPage'));
const SearchPage = lazyWithRetry(() => import('@/pages/SearchPage'));
const NewsletterStatusPage = lazyWithRetry(() => import('@/pages/NewsletterStatusPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage'));

const AdminLoginPage = lazyWithRetry(() => import('@/pages/admin/AdminLoginPage'));
const AdminProfilePage = lazyWithRetry(() => import('@/pages/admin/AdminProfilePage'));
const AdminSkillsPage = lazyWithRetry(() => import('@/pages/admin/AdminSkillsPage'));
const AdminExperiencePage = lazyWithRetry(() => import('@/pages/admin/AdminExperiencePage'));
const AdminProjectsPage = lazyWithRetry(() => import('@/pages/admin/AdminProjectsPage'));
const AdminBlogPage = lazyWithRetry(() => import('@/pages/admin/AdminBlogPage'));
const AdminCertificatesPage = lazyWithRetry(() => import('@/pages/admin/AdminCertificatesPage'));
const AdminAchievementsPage = lazyWithRetry(() => import('@/pages/admin/AdminAchievementsPage'));
const AdminSettingsPage = lazyWithRetry(() => import('@/pages/admin/AdminSettingsPage'));

export default function App() {
  return (
    <SiteChrome>
      <ScrollToTop />
      <PageViewTracker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/search" element={<SearchPage />} />
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
          <Route path="/admin/setting" element={<AdminSettingsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </SiteChrome>
  );
}
