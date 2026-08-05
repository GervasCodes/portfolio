import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-7o3j.onrender.com';

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

  // Experience
  getExperience: (type) => request(api.get('/experience', { params: type ? { type } : {} })),

  // Blog
  getPosts: (params) => request(api.get('/blog', { params })),
  getPostBySlug: (slug) => request(api.get(`/blog/${slug}`)),
  getAllPostsAdmin: () => request(api.get('/blog/admin/all')),
  createPost: (payload) => request(api.post('/blog', payload)),
  updatePost: (id, payload) => request(api.put(`/blog/${id}`, payload)),
  deletePost: (id) => request(api.delete(`/blog/${id}`)),

  // Contact
  sendContactMessage: (payload) => request(api.post('/contact', payload)),
  getContactMessages: () => request(api.get('/contact')),

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

  // Auth
  login: (payload) => request(api.post('/auth/login', payload)),
  logout: () => request(api.post('/auth/logout')),
  me: () => request(api.get('/auth/me')),
};

export default PortfolioAPI;
