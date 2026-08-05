-- Sample data so the portfolio isn't empty on first run.

INSERT INTO profiles (full_name, title, tagline, bio, email, location, github_url, linkedin_url, years_experience, available_for_work)
VALUES (
  'Your Name', 'Full-Stack Software Engineer',
  'Building scalable, production-grade web applications.',
  'A passionate software engineer specializing in modern full-stack development, clean architecture, and delightful user experiences.',
  'you@example.com', 'Dar es Salaam, Tanzania',
  'https://github.com/yourhandle', 'https://linkedin.com/in/yourhandle',
  3, TRUE
);

INSERT INTO skills (name, category, proficiency, sort_order) VALUES
('JavaScript', 'Languages', 90, 1),
('TypeScript', 'Languages', 80, 2),
('React', 'Frontend', 90, 1),
('Next.js', 'Frontend', 85, 2),
('Tailwind CSS', 'Frontend', 90, 3),
('Node.js', 'Backend', 88, 1),
('Express.js', 'Backend', 85, 2),
('MySQL', 'Database', 80, 1),
('Supabase', 'Database', 75, 2);

INSERT INTO projects (title, slug, summary, description, tech_stack, category, featured, status, sort_order) VALUES
('Developer Portfolio & CMS', 'developer-portfolio-cms',
 'A full-stack portfolio with a custom admin dashboard.',
 'Production-grade personal portfolio built with Next.js, Express, MySQL, and Supabase Storage, featuring a private CMS for managing all content.',
 JSON_ARRAY('Next.js', 'Express', 'MySQL', 'Supabase'), 'Full-Stack', TRUE, 'published', 1);

INSERT INTO experiences (type, title, organization, location, start_date, is_current, description, sort_order) VALUES
('work', 'Software Engineer', 'Freelance / Independent', 'Remote', '2023-01-01', TRUE,
 'Designing and building full-stack web applications for clients across multiple industries.', 1),
('education', 'B.Sc. Computer Science', 'University', 'Dar es Salaam, Tanzania', '2019-09-01', FALSE,
 'Focused on software engineering, data structures, and distributed systems.', 1);

INSERT INTO settings (setting_key, setting_value) VALUES
('site_title', 'Your Name — Software Engineer'),
('site_description', 'Full-stack developer portfolio and personal CMS.'),
('theme', 'dark');
