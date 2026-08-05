-- Admin accounts table — stores the hashed credentials for the portfolio owner.
-- The application seeds the initial admin on startup (idempotent) using
-- ADMIN_EMAIL and ADMIN_PASSWORD from .env; ADMIN_PASSWORD is hashed with
-- bcrypt before insertion and never stored as plain text.

CREATE TABLE IF NOT EXISTS admins (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  role       VARCHAR(50)  NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_email (email)
);
