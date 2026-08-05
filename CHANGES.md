# CHANGES.md

Summary of every file added or modified in this patch, with the reason for each change.

---

## New files

### `database/migrations/002_admin.sql`
**Reason:** Introduces the `admins` table that stores administrator credentials.  
The table holds a bcrypt hash (never plain text) alongside the email, role, and audit timestamps. A unique index on `email` prevents duplicate accounts at the database level, providing a race-safe idempotency guarantee in addition to the application-level check.

### `backend/src/models/Admin.js`
**Reason:** Repository model for the `admins` table.  
Extends `BaseModel` with a `findByEmail` helper. The `password` column is deliberately excluded from `fillable` so that generic CRUD helpers can never accidentally write or overwrite the hash — credential updates must be done through an explicit, auditable code path.

### `backend/src/services/adminInit.service.js`
**Reason:** Implements the idempotent admin initialization requirement.  
On every application startup:
1. Queries the `admins` table for the configured `ADMIN_EMAIL`.
2. If the row is absent, hashes `ADMIN_PASSWORD` with bcrypt (cost 12) and inserts it.
3. If the row already exists (or a concurrent insert wins the race via `ER_DUP_ENTRY`), skips silently.

The plain-text password is consumed once in memory and never logged or persisted. A missing `ADMIN_EMAIL` / `ADMIN_PASSWORD` is warned, not crashed, so the server remains available for public routes.

---

## Modified files

### `backend/src/config/env.js`
**Reason:** Replaces `ADMIN_PASSWORD_HASH` with `ADMIN_PASSWORD`.  
The old design required operators to manually run bcrypt and paste the hash into `.env`. The new design accepts the plain-text password and lets the application hash it automatically at first boot, reducing configuration errors and eliminating the risk of copy-paste mistakes in the hash string. The comment documents the lifecycle so operators understand the value is only used during initial setup.

### `backend/src/controllers/auth.controller.js`
**Reason:** Switches credential verification from `.env` to the `admins` database table.  
Key security improvements:
- Credentials are now looked up from the database (single source of truth), not from environment variables at login time.
- A constant-time bcrypt compare is always performed even when no admin row is found, preventing timing-based user-enumeration attacks.
- The response no longer leaks which field was wrong ("email not found" vs "wrong password") — both cases return the same generic `Invalid credentials` message.

### `backend/src/server.js`
**Reason:** Wires `initializeAdmin()` into the startup sequence.  
Called after a successful DB connection test so the `admins` table is guaranteed to exist. An `await` ensures the check completes before the HTTP server begins accepting requests, preventing a narrow window where a login attempt could arrive before the admin row is written. The DB-connection failure path is kept non-fatal (consistent with existing behaviour) so public routes remain available even if the DB is temporarily unreachable.

### `backend/.env.example`
**Reason:** Updated to document the new `ADMIN_PASSWORD` variable and remove the obsolete `ADMIN_PASSWORD_HASH` entry. Added inline comments explaining the credential lifecycle (plain-text in `.env` → bcrypt hash in DB) so future operators understand why both fields are present and what happens on first startup.
