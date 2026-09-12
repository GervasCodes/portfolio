-- Optional image gallery for achievements (array of image URLs, JSON).
-- Stays NULL/empty for achievements that don't need extra photos — the
-- single-icon `icon_url` field is untouched and still works on its own.
ALTER TABLE achievements
  ADD COLUMN gallery JSON NULL AFTER icon_url;
