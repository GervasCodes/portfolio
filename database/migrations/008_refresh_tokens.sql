-- Phase 4 — Admin Auth Hardening: refresh-token rotation.
--
-- The access token (the `token` cookie) is now short-lived (see
-- JWT_EXPIRES_IN). A refresh token is a long-lived, single-use credential
-- exchanged for a new access+refresh pair via POST /auth/refresh. Only the
-- SHA-256 hash of the raw token is ever stored — the raw value lives only
-- in the httpOnly `refresh_token` cookie on the admin's browser.
--
-- Rotation + reuse detection: each refresh consumes the current row
-- (`revoked_at` set, `replaced_by` pointing at the new token's hash) and
-- issues a new one. If a token whose `revoked_at` is already set is ever
-- presented again — meaning it was stolen and used after the legitimate
-- rotation already happened — every other active token for that admin is
-- revoked too, forcing a fresh login everywhere.

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT          NOT NULL,
  token_hash  CHAR(64)     NOT NULL COMMENT 'sha256 hex digest of the raw refresh token',
  expires_at  TIMESTAMP    NOT NULL,
  revoked_at  TIMESTAMP    NULL,
  replaced_by CHAR(64)     NULL COMMENT 'token_hash of the token that rotated this one out',
  user_agent  VARCHAR(255) NULL,
  ip          VARCHAR(64)  NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_refresh_tokens_hash (token_hash),
  INDEX idx_refresh_tokens_admin (admin_id),
  CONSTRAINT fk_refresh_tokens_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
