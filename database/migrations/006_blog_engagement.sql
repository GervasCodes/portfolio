-- Phase 3: Blog Engagement
-- Adds dedicated tables for deduped view tracking and lightweight emoji
-- reactions on blog posts. `blogs.views` (added in 001_init.sql) remains
-- the fast-to-read running total; these tables are what make it accurate
-- (one counted view per visitor per time window) instead of counting
-- every page load like a raw hit log.

-- One row per (blog post, visitor). `viewer_key` identifies the visitor via
-- an anonymous long-lived cookie (see backend `bvid` cookie); `ip_address`
-- is stored alongside it for the same reason `analytics_visits` records IP
-- — as a secondary signal for the admin, not as the dedupe key by itself
-- (shared/office IPs would otherwise under-count distinct visitors).
CREATE TABLE IF NOT EXISTS blog_post_views (
  id             INT          AUTO_INCREMENT PRIMARY KEY,
  blog_id        INT          NOT NULL,
  viewer_key     VARCHAR(128) NOT NULL,
  ip_address     VARCHAR(64),
  view_count     INT          NOT NULL DEFAULT 1,
  last_viewed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_blog_post_views_viewer (blog_id, viewer_key),
  INDEX idx_blog_post_views_blog (blog_id),
  CONSTRAINT fk_blog_post_views_blog FOREIGN KEY (blog_id)
    REFERENCES blogs (id) ON DELETE CASCADE
);

-- One reaction per (blog post, visitor) — reacting again with a different
-- emoji swaps it rather than stacking, keeping this simple (no comments,
-- no auth, just a quick pulse-check per post).
CREATE TABLE IF NOT EXISTS blog_reactions (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  blog_id    INT          NOT NULL,
  viewer_key VARCHAR(128) NOT NULL,
  emoji      VARCHAR(16)  NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_blog_reactions_viewer (blog_id, viewer_key),
  INDEX idx_blog_reactions_blog (blog_id),
  CONSTRAINT fk_blog_reactions_blog FOREIGN KEY (blog_id)
    REFERENCES blogs (id) ON DELETE CASCADE
);
