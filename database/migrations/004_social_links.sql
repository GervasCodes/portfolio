-- Adds Instagram and WhatsApp contact fields to the profile.
-- Additive only — no existing columns are touched or removed, so this
-- is safe to run against an existing database. `twitter_url` is left
-- in place (unused by the app going forward) to avoid a destructive
-- migration on data that may already exist in production.
--
-- NOTE: no `IF NOT EXISTS` on the columns — that combined syntax needs
-- MySQL 8.0.29+ and isn't supported on older MySQL or on MariaDB. If you
-- ever need to re-run this file against a DB that already has these
-- columns, drop them first or skip this file.

ALTER TABLE profiles
  ADD COLUMN instagram_url VARCHAR(255) AFTER linkedin_url,
  ADD COLUMN whatsapp_number VARCHAR(50) AFTER instagram_url;
