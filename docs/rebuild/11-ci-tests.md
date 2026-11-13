# CI runs the tests (done)

`00-baseline.md` noted that CI never ran tests although `docs/ROADMAP.md` said it did.

## Changes
- **New `.github/workflows/tests.yml`** (push and PR to `main`): backend `npm test` (`node --test`, includes the new CSRF coverage test) and frontend `npm run check:design`.
- **`ci.yml` unchanged except its header comment**, which said tests were deliberately excluded. It now says lint + build only and points to `tests.yml`. Its own comment asked for tests to go in a separate workflow, so I did not merge them into it.
- **`docs/ROADMAP.md`** now describes the two workflows accurately.

## Not done
- The database integration test stays skipped in CI (needs real MySQL and `INTEGRATION_TEST_DB=1`). A MySQL service container could be added later.
- Workflows were not run on GitHub; YAML parses locally and the same commands pass locally (backend 26 pass / 0 fail / 1 skipped, design check passes).
- `ROADMAP.md` mentions `.github/workflows/backup.yml`, but that file is not tracked in git (only `ci.yml` and `dependabot.yml` are). Check whether it exists in your remote.
- Dependabot has open branches bumping Actions to v7; `tests.yml` uses `@v4` like `ci.yml` and should be bumped together with it.
