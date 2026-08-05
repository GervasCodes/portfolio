# API Reference

Base URL: `http://localhost:5000/api` (or your deployed backend URL).
All responses use the shape: `{ success, statusCode, message, data?, meta? }`.

Admin-only routes require a Bearer JWT (`Authorization: Bearer <token>`) or the
`token` httpOnly cookie set on login.

## Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | `{ email, password }` → `{ token, user }` |
| POST | `/auth/logout` | — | Clears the auth cookie |
| GET | `/auth/me` | ✅ | Returns the decoded token payload |

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
| GET | `/blog/:slug` | — | Single post (increments view count) |
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
