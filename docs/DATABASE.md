# Database

MySQL 8+ (designed for Aiven's managed MySQL, which requires SSL).

## Setup
1. Create a database (e.g. `portfolio`) on your Aiven MySQL service.
2. Copy `.env.example` to `.env` in `backend/` and fill in `DB_*`.
3. Run the migration: `cd backend && npm run migrate`
4. (Optional) Seed sample content: `npm run seed`

Migrations live in `database/migrations/*.sql` and run in filename order.
Seeds live in `database/seeds/*.sql`.

## Schema overview
- **profiles** — singleton row with owner bio/contact/social links
- **projects** — portfolio projects (`gallery`, `tech_stack` stored as JSON)
- **skills** — name/category/proficiency, grouped by category in the API
- **experiences** — shared table for both `work` and `education` timeline entries
- **blogs** — articles with `tags` (JSON), `status`, `views`
- **certificates** — issued certifications with credential links
- **achievements** — notable milestones/awards
- **contacts** — messages submitted via the public contact form
- **media** — records of files uploaded to Supabase Storage
- **settings** — key/value store for site-wide settings
- **analytics_visits** — lightweight page-view log used for the admin traffic chart

## Testing against a real database
`backend/tests/integration.test.js` runs real queries (create/read/paginate/delete)
against an actual MySQL instance. It's skipped by default. To run it locally:
```
mysql -u root -e "CREATE DATABASE portfolio_test;"
cd backend
DB_NAME=portfolio_test npm run migrate
INTEGRATION_TEST_DB=1 DB_NAME=portfolio_test npm test
```

## Notes
- All models extend `backend/src/models/BaseModel.js`, a small repository-pattern
  base class providing generic `findAll/findById/create/update/delete`. Resource-specific
  logic (slugs, JSON (de)serialization, search) lives in the subclass.
- JSON columns (`gallery`, `tech_stack`, `tags`) are serialized/deserialized transparently
  by the model layer — controllers always work with plain arrays.
