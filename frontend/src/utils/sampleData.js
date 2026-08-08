/**
 * Fallback content shown when the API is unreachable (e.g. first run,
 * before the database is seeded) so the site never looks broken.
 * Every page tries the live API first and only falls back to this.
 */
export const sampleProfile = {
  full_name: 'Gervas Gervas',
  title: 'Full-Stack Web Developer',
  tagline: 'I design and build production-grade web applications.',
  bio: 'A passionate software engineer specializing in modern full-stack development, clean architecture, and delightful user experiences. I care about scalable systems as much as pixel-perfect interfaces.',
  avatar_url: null,
  resume_url: '#',
  email: 'amgerryofficial@example.com',
  location: 'Dar es Salaam, Tanzania',
  github_url: 'https://github.com',
  linkedin_url: 'https://linkedin.com',
  instagram_url: 'https://instagram.com',
  whatsapp_number: '',
  years_experience: 3,
  available_for_work: true,
};
export const sampleSkills = {
  Languages: [
    { id: 1, name: 'JavaScript', proficiency: 90 },
    { id: 2, name: 'TypeScript', proficiency: 80 },
  ],
  Frontend: [
    { id: 3, name: 'React', proficiency: 90 },
    { id: 4, name: 'Next.js', proficiency: 85 },
    { id: 5, name: 'Tailwind CSS', proficiency: 90 },
  ],
  Backend: [
    { id: 6, name: 'Node.js', proficiency: 88 },
    { id: 7, name: 'Express.js', proficiency: 85 },
  ],
  Database: [
    { id: 8, name: 'MySQL', proficiency: 80 },
    { id: 9, name: 'Supabase', proficiency: 75 },
  ],
};
export const sampleProjects = [
  {
    id: 1,
    title: 'Developer Portfolio & CMS',
    slug: 'developer-portfolio-cms',
    summary: 'A full-stack portfolio with a private admin dashboard.',
    description: 'Production-grade personal portfolio built with Next.js, Express, MySQL, and Supabase Storage, featuring a custom CMS for managing every section without touching code.',
    tech_stack: ['Next.js', 'Express', 'MySQL', 'Supabase', 'Tailwind CSS'],
    category: 'Full-Stack',
    featured: true,
    repo_url: '#',
    live_url: '#',
    cover_image_url: null,
    gallery: [],
    case_study_enabled: true,
    case_study_problem: 'Most portfolio templates require editing code and redeploying just to add a project or fix a typo, which discourages keeping the site up to date.',
    case_study_approach: 'Built a small custom CMS instead of adopting a headless one, so the data model and admin UI could match this site\'s sections exactly.',
    case_study_architecture: 'React (Vite) frontend, Express/MySQL backend on Aiven, media on Supabase Storage, JWT + refresh-token admin auth.',
    case_study_results: 'Every section — projects, blog, skills, timeline — is editable from `/admin` with zero code changes or redeploys.',
  },
  {
    id: 2,
    title: 'Realtime Task Board',
    slug: 'realtime-task-board',
    summary: 'A Trello-style kanban board with realtime sync.',
    description: 'Drag-and-drop task management with optimistic UI updates and realtime collaboration.',
    tech_stack: ['React', 'Node.js', 'Socket.io'],
    category: 'Web App',
    featured: true,
    repo_url: '#',
    live_url: '#',
    cover_image_url: null,
    gallery: [],
  },
  {
    id: 3,
    title: 'E-commerce API',
    slug: 'ecommerce-api',
    summary: 'A RESTful commerce backend with layered architecture.',
    description: 'Order management, inventory, and payments API built with the repository and service layer patterns.',
    tech_stack: ['Express', 'MySQL', 'Stripe'],
    category: 'Backend',
    featured: false,
    repo_url: '#',
    live_url: '#',
    cover_image_url: null,
    gallery: [],
  },
];
export const sampleExperience = [
  {
    id: 1,
    type: 'work',
    title: 'Web Developer',
    organization: 'Freelance / Independent',
    location: 'Remote',
    start_date: '2023-01-01',
    end_date: null,
    is_current: true,
    description: 'Designing and building full-stack web applications across multiple industries.',
  },
];
export const sampleEducation = [
  {
    id: 1,
    type: 'education',
    title: 'B.Sc. Computer Science',
    organization: 'National Institute of Transport',
    location: 'Dar es Salaam, Tanzania',
    start_date: '2023',
    end_date: '2026',
    is_current: false,
    description: 'Focused on software engineering, data structures, and distributed systems.',
  },
];
export const sampleBlogPosts = [
  {
    id: 1,
    title: 'Designing a Layered Backend Architecture',
    slug: 'layered-backend-architecture',
    excerpt: 'Why separating controllers, services, and repositories pays off as an app grows.',
    content: 'Full article content goes here once published from the admin dashboard.',
    tags: ['Architecture', 'Node.js'],
    published_at: new Date().toISOString(),
    views: 128,
  },
];