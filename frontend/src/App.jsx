import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteChrome from '@/components/layout/SiteChrome';
import ScrollToTop from '@/components/layout/ScrollToTop';
import PageLoader from '@/components/layout/PageLoader';

// Every route is loaded on demand instead of being bundled into the
// initial JS payload. This is what actually fixes the "chunk larger
// than 500kB" warning: recharts, react-markdown, and the entire admin
// dashboard (which most visitors never open) get their own chunks
// that only download when that route is visited.
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const SkillsPage = lazy(() => import('@/pages/SkillsPage'));
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'));
const ResumePage = lazy(() => import('@/pages/ResumePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const NewsletterStatusPage = lazy(() => import('@/pages/NewsletterStatusPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));
const AdminSkillsPage = lazy(() => import('@/pages/admin/AdminSkillsPage'));
const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'));
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage'));
const AdminCertificatesPage = lazy(() => import('@/pages/admin/AdminCertificatesPage'));
const AdminAchievementsPage = lazy(() => import('@/pages/admin/AdminAchievementsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

export default function App() {
  return (
    <SiteChrome>
      <ScrollToTop />
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
