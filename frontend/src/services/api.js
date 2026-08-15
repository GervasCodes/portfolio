import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-backend-7o3j.onrender.com';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,   // FIX: all backend routes are mounted under /api
  withCredentials: true,
});

// Attach the admin JWT (if present) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('portfolio_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// When an access token expires (short-lived by design — see
// JWT_EXPIRES_IN), the backend rejects it with 401. Rather than bouncing
// the admin to the login page, silently exchange the httpOnly refresh
// cookie for a new access token via POST /auth/refresh and retry the
// original request once. Concurrent 401s share a single in-flight refresh
// so a burst of requests doesn't trigger a burst of rotations.
let refreshPromise = null;
const AUTH_ENDPOINTS_TO_SKIP = ['/auth/login', '/auth/login/verify', '/auth/refresh', '/auth/logout'];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;
    const isAuthEndpoint = config && AUTH_ENDPOINTS_TO_SKIP.some((p) => config.url?.includes(p));

    if (response?.status !== 401 || isAuthEndpoint || config._retry) {
      throw err;
    }
    config._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').finally(() => {
          refreshPromise = null;
        });
      }
      const { data } = await refreshPromise;
      if (typeof window !== 'undefined' && data?.data?.token) {
        window.localStorage.setItem('portfolio_token', data.data.token);
      }
      return api(config);
    } catch (refreshErr) {
      // Refresh failed — the admin session is dead (expired refresh token,
      // or it never reached the server at all, as happened with the
      // SameSite=Lax cross-site cookie bug). Whatever the admin was doing
      // (e.g. saving an experience/resume edit) has failed too. Send them
      // back to login instead of leaving them on a page that will keep
      // silently failing every subsequent save.
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('portfolio_token');
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
      throw err;
    }
  }
);

/**
 * Small wrapper so every call site gets `{ data, error }` instead of
 * having to try/catch axios everywhere. Keeps components declarative.
 */
async function request(promise) {
  try {
    const res = await promise;
    return { data: res.data?.data, meta: res.data?.meta, error: null };
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Request failed';
    return { data: null, meta: null, error: message };
  }
}

export const PortfolioAPI = {
  // Profile
  getProfile: () => request(api.get('/profile')),
  saveProfile: (payload) => request(api.put('/profile', payload)),

  // Projects
  getProjects: (params) => request(api.get('/projects', { params })),
  getFeaturedProjects: (limit = 6) => request(api.get('/projects/featured', { params: { limit } })),
  getProjectBySlug: (slug) => request(api.get(`/projects/${slug}`)),
  getProjectById: (id) => request(api.get(`/projects/id/${id}`)),
  createProject: (payload) => request(api.post('/projects', payload)),
  updateProject: (id, payload) => request(api.put(`/projects/${id}`, payload)),
  deleteProject: (id) => request(api.delete(`/projects/${id}`)),

  // Project gallery media (images + videos)
  getProjectMedia: (projectId) => request(api.get(`/projects/${projectId}/media`)),
  updateProjectMedia: (projectId, mediaId, payload) =>
    request(api.put(`/projects/${projectId}/media/${mediaId}`, payload)),
  deleteProjectMedia: (projectId, mediaId) =>
    request(api.delete(`/projects/${projectId}/media/${mediaId}`)),
  reorderProjectMedia: (projectId, orderedIds) =>
    request(api.put(`/projects/${projectId}/media/reorder`, { orderedIds })),

  // Skills
  getSkills: () => request(api.get('/skills')),
  createSkill: (payload) => request(api.post('/skills', payload)),
  updateSkill: (id, payload) => request(api.put(`/skills/${id}`, payload)),
  deleteSkill: (id) => request(api.delete(`/skills/${id}`)),

  // Experience & Education (same table, disambiguated by `type`)
  getExperience: (type) => request(api.get('/experience', { params: type ? { type } : {} })),
  createExperience: (payload) => request(api.post('/experience', payload)),
  updateExperience: (id, payload) => request(api.put(`/experience/${id}`, payload)),
  deleteExperience: (id) => request(api.delete(`/experience/${id}`)),

  // Blog
  getPosts: (params) => request(api.get('/blog', { params })),
  getMostViewedPosts: (limit = 5) => request(api.get('/blog/most-viewed', { params: { limit } })),
  getPostBySlug: (slug) => request(api.get(`/blog/${slug}`)),
  getAllPostsAdmin: () => request(api.get('/blog/admin/all')),
  createPost: (payload) => request(api.post('/blog', payload)),
  updatePost: (id, payload) => request(api.put(`/blog/${id}`, payload)),
  deletePost: (id) => request(api.delete(`/blog/${id}`)),

  // Blog engagement — reactions are keyed to an anonymous visitor cookie,
  // no login required.
  getReactions: (slug) => request(api.get(`/blog/${slug}/reactions`)),
  setReaction: (slug, emoji) => request(api.post(`/blog/${slug}/reactions`, { emoji })),
  removeReaction: (slug) => request(api.delete(`/blog/${slug}/reactions`)),

  // Search — combined LIKE search across projects + blog posts.
  // type: 'all' | 'projects' | 'blog'
  search: (params) => request(api.get('/search', { params })),

  // Contact
  sendContactMessage: (payload) => request(api.post('/contact', payload)),
  getContactMessages: () => request(api.get('/contact')),

  // Newsletter — double opt-in "notify me on new posts" signup
  subscribeNewsletter: (email) => request(api.post('/newsletter/subscribe', { email })),
  confirmNewsletter: (token) => request(api.post('/newsletter/confirm', { token })),
  unsubscribeNewsletter: (token) => request(api.post('/newsletter/unsubscribe', { token })),
  getNewsletterSubscribers: (limit) => request(api.get('/newsletter/subscribers', { params: { limit } })),
  getNewsletterStats: (days) => request(api.get('/newsletter/stats', { params: { days } })),

  // Certificates
  getCertificates: () => request(api.get('/certificates')),
  createCertificate: (payload) => request(api.post('/certificates', payload)),
  updateCertificate: (id, payload) => request(api.put(`/certificates/${id}`, payload)),
  deleteCertificate: (id) => request(api.delete(`/certificates/${id}`)),

  // Achievements
  getAchievements: () => request(api.get('/achievements')),
  createAchievement: (payload) => request(api.post('/achievements', payload)),
  updateAchievement: (id, payload) => request(api.put(`/achievements/${id}`, payload)),
  deleteAchievement: (id) => request(api.delete(`/achievements/${id}`)),

  // Settings / Analytics
  getSettings: () => request(api.get('/settings')),
  updateSettings: (payload) => request(api.put('/settings', payload)),
  getAnalytics: (days) => request(api.get('/analytics', { params: { days } })),
  recordPageView: (path) => request(api.post('/analytics/pageview', { path })),

  // Auth
  login: (payload) => request(api.post('/auth/login', payload)),
  verifyMfa: (payload) => request(api.post('/auth/login/verify', payload)),
  logout: () => request(api.post('/auth/logout')),
  me: () => request(api.get('/auth/me')),

  // 2FA (TOTP) management — requires an existing admin session.
  setupTotp: () => request(api.get('/auth/2fa/setup')),
  enableTotp: (code) => request(api.post('/auth/2fa/enable', { code })),
  disableTotp: (password) => request(api.post('/auth/2fa/disable', { password })),
};

export default PortfolioAPI;
