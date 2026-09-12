-- Adds picture (already had cover_image_url, now exposed in the admin UI),
-- video, and external-link support to blog posts so a post can carry a
-- vlog-style video and/or a related link alongside its cover image.
ALTER TABLE blogs
  ADD COLUMN video_url VARCHAR(500) NULL AFTER cover_image_url,
  ADD COLUMN link_url VARCHAR(500) NULL AFTER video_url;
