-- Adds Instagram and WhatsApp contact fields to the profile.
-- Plain ALTER TABLE statements — idempotency is handled by the migrate script.
ALTER TABLE profiles ADD COLUMN instagram_url VARCHAR(255) AFTER linkedin_url;
ALTER TABLE profiles ADD COLUMN whatsapp_number VARCHAR(50) AFTER instagram_url;
