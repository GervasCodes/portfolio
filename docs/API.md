# API Reference

Base URL: `http://localhost:5000/api` (or your deployed backend URL).
All responses use the shape: `{ success, statusCode, message, data?, meta? }`.

Admin-only routes require a Bearer JWT (`Authorization: Bearer <token>`) or the
`token` httpOnly cookie set on login. Access tokens are short-lived
(`JWT_EXPIRES_IN`, default 15m); when one expires, exchange the
`refresh_token` cookie for a new pair via `POST /auth/refresh` instead of
forcing the admin to log in again. `POST /auth/login`, `/auth/login/verify`,
and `/auth/refresh` are additionally rate-limited (5 failed attempts / 15 min
for login, 30 / 15 min for refresh, per IP) on top of the API-wide limit.

## Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | `{ email, password }` → `{ token, user }`, or `{ mfaRequired: true, mfaToken }` if 2FA is enabled |
| POST | `/auth/login/verify` | — | `{ mfaToken, code }` → `{ token, user }`. Second step of login when 2FA is enabled |
| POST | `/auth/refresh` | — (needs `refresh_token` cookie) | Rotates the refresh token and issues a new `{ token, user }` pair |
| POST | `/auth/logout` | — | Revokes the current refresh token and clears both auth cookies |
| GET | `/auth/me` | ✅ | Returns the decoded token payload plus `totpEnabled` |
| GET | `/auth/2fa/setup` | ✅ | Generates a TOTP secret, stores it pending confirmation, returns `{ secret, otpauthUrl, qrCodeDataUrl }` |
| POST | `/auth/2fa/enable` | ✅ | `{ code }` → confirms the pending secret and turns 2FA on |
| POST | `/auth/2fa/disable` | ✅ | `{ password }` → turns 2FA off and clears the stored secret |

## Profile
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/profile` | — | Get the single profile record |
| PUT | `/profile` | ✅ | Create/update the profile (upsert) |

## Projects
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/projects?q=&category=&page=&limit=` | — | Paginated, filterable published projects |
| GET | `/projects/featured?limit=6` | — | Featured, published projects |
| GET | `/projects/:slug` | — | Single project by slug |
| GET | `/projects/id/:id` | ✅ | Single project by id (for editing) |
| POST | `/projects` | ✅ | Create a project |
| PUT | `/projects/:id` | ✅ | Update a project |
| DELETE | `/projects/:id` | ✅ | Delete a project |

## Blog
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/blog?page=&limit=&tag=` | — | Paginated published posts |
| GET | `/blog/most-viewed?limit=5` | — | Top published posts by view count |
| GET | `/blog/:slug` | — | Single post (increments view count, deduped per visitor/24h) |
| GET | `/blog/:slug/reactions` | — | Emoji reaction counts + the caller's own reaction |
| POST | `/blog/:slug/reactions` | — | `{ emoji }` → set/swap the caller's reaction |
| DELETE | `/blog/:slug/reactions` | — | Remove the caller's reaction |
| GET | `/blog/admin/all` | ✅ | All posts, including drafts |
| POST | `/blog` | ✅ | Create a post |
| PUT | `/blog/:id` | ✅ | Update a post |
| DELETE | `/blog/:id` | ✅ | Delete a post |

## Skills
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/skills` | — | Skills grouped by category |
| POST | `/skills` | ✅ | Create a skill |
| PUT | `/skills/:id` | ✅ | Update a skill |
| DELETE | `/skills/:id` | ✅ | Delete a skill |

## Experience
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/experience?type=work|education` | — | List entries, optionally filtered |
| POST | `/experience` | ✅ | Create an entry |
| PUT | `/experience/:id` | ✅ | Update an entry |
| DELETE | `/experience/:id` | ✅ | Delete an entry |

## Media
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/media` | ✅ | List uploaded media records |
| POST | `/media` (multipart, field `file`) | ✅ | Upload to Supabase Storage; `kind` = `image`\|`resume`\|`document` |
| DELETE | `/media/:id` | ✅ | Delete a media record |

## Contact
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/contact` | — | Submit the public contact form |
| GET | `/contact` | ✅ | List submitted messages |
| PATCH | `/contact/:id/read` | ✅ | Mark a message as read |
| DELETE | `/contact/:id` | ✅ | Delete a message |

## Newsletter
Double opt-in "notify me on new posts" signup. `POST /confirm` and
`POST /unsubscribe` are what the links in the confirmation/notification
emails point the frontend at (`/newsletter/confirm?token=`,
`/newsletter/unsubscribe?token=`) — the frontend page reads the token
from the query string and POSTs it here.
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/newsletter/subscribe` | — | `{ email }` — starts (or restarts) double opt-in |
| POST | `/newsletter/confirm` | — | `{ token }` — confirms a pending subscription |
| POST | `/newsletter/unsubscribe` | — | `{ token }` — unsubscribes |
| GET | `/newsletter/subscribers?limit=200` | ✅ | List subscribers, most recent first |
| GET | `/newsletter/stats?days=30` | ✅ | Totals + daily signup counts, for the admin dashboard widget |

## Certificates / Achievements / Settings / Analytics
| Method | Route | Auth | Description |
|---|---|---|---|
| GET/POST/PUT/DELETE | `/certificates[/:id]` | mixed | CRUD for certifications |
| GET/POST/PUT/DELETE | `/achievements[/:id]` | mixed | CRUD for achievements |
| GET | `/settings` | — | Key/value site settings |
| PUT | `/settings` | ✅ | Bulk-update settings |
| GET | `/analytics?days=30` | ✅ | Visit totals, top pages, daily trend |

## Errors
Non-2xx responses look like:
```json
{ "success": false, "statusCode": 404, "message": "Project not found" }
```
