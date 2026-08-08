-- Phase 4 — Admin Auth Hardening: TOTP-based two-factor authentication.
--
-- `totp_secret` holds the base32 secret as soon as the admin starts the
-- setup flow (GET /auth/2fa/setup); it is NOT yet enforced at that point.
-- `totp_enabled` flips to 1 only after the admin proves possession of the
-- secret by submitting a valid code to POST /auth/2fa/enable. Login only
-- requires a TOTP code once `totp_enabled = 1`, so a half-finished setup
-- can never lock the admin out.

ALTER TABLE admins
  ADD COLUMN totp_secret  VARCHAR(255) NULL COMMENT 'base32 TOTP secret; set during setup, cleared on disable',
  ADD COLUMN totp_enabled TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1 once a code has been confirmed and 2FA is enforced at login';
