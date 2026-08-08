-- Newsletter / "notify me on new posts" signups. A dedicated table
-- (rather than piggybacking on `contacts`) since subscribers have their
-- own lifecycle: pending -> confirmed -> unsubscribed, driven by a
-- double opt-in token rather than an admin marking something read.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  email                     VARCHAR(255) NOT NULL UNIQUE,
  status                    ENUM('pending', 'confirmed', 'unsubscribed') NOT NULL DEFAULT 'pending',
  confirm_token             VARCHAR(64) NOT NULL,
  confirm_token_expires_at  DATETIME NOT NULL,
  confirmed_at              DATETIME NULL,
  unsubscribed_at           DATETIME NULL,
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_newsletter_status (status),
  INDEX idx_newsletter_token (confirm_token),
  INDEX idx_newsletter_created (created_at)
);
