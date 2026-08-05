# Database

SQL lives here, not in application code, so the schema can be reviewed,
versioned, and applied independently of the backend.

- `migrations/` — schema definitions, applied in filename order via
  `cd backend && npm run migrate`
- `seeds/` — optional sample data, applied via `npm run seed`

See `../docs/DATABASE.md` for the full schema overview and setup steps.
