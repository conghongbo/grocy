# React migration implementation

The original frontend consists of 74 top-level Blade views plus reusable components and page-specific jQuery scripts. The backend has 16 top-level controllers, 13 API controllers, and 19 services. Existing `frontend/` was a Vite starter; no application migration existed. `docs/baseline.md` lists historical PASS results but contains no reproducible baseline evidence or commit measurements.

## Rollout

The opt-in `/react` route is registered in the existing page route group. `ReactController` renders a minimal Blade host with no jQuery or Bootstrap dependencies. Missing build assets yield a descriptive 503. PHP/backend services and schema are unchanged. The original routes remain the functional fallback, so incomplete parity does not remove existing workflows.

Run `npm ci && npm run build` in `frontend/` as part of packaging. Deploy generated `public/react/` assets with PHP. Generated assets and node_modules are ignored. Rebuild assets on each frontend change. Open the ordinary Grocy root once on new installations to perform existing schema initialization before visiting `/react`.

The client uses session cookies, URLs from UrlManager, JSON requests and existing API error messages. An empty successful response is supported for task completion and undo. Server errors, malformed HTML, expired sessions, request cancellation and failed mutations have distinct UI handling. The backend continues enforcing permissions. No credentials are persisted by React.

Hash navigation avoids server wildcard routes and supports links such as `/react#chores`. Module flags are supplied by PHP. Search operates locally on existing list endpoints. Dates remain server-formatted strings; optional tracking input is sent as Grocy's local SQL datetime format, with server time used by default.

## Validation on 2026-10-01

- `npm run build --prefix frontend`: PASS (strict TypeScript and production bundling).
- `npm run lint --prefix frontend`: PASS.
- `npm test --prefix frontend`: PASS, five transport tests covering credentials/headers, empty success, backend errors, expired session/HTML and cancellation.
- `php -l controllers/ReactController.php`, `php -l routes.php`: PASS.
- `git diff --check`: PASS.
- Temporary PHP 8.5 server with `GROCY_DATAPATH=/tmp/grocy-react-smoke`: `/react` returned the expected HTML shell and bootstrap config.
- Seven real list endpoints returned arrays: stock, products, quantity units, locations, tasks, chores, batteries.
- Real task completion removed the current task, undo restored it. Chore execution/undo and battery charge/undo succeeded with returned execution IDs.

All integration mutations used an isolated temporary database; the repository's existing database was not modified. The existing demo data generator timed out during initial startup, but migrations and sufficient fixtures completed for the checks above. No browser interaction or visual QA was performed. Stock mutations, denied permissions, authenticated session expiry, subdirectory deployments and disabled URL rewriting require additional end-to-end validation before making React the default.

## Next stages

1. Add browser tests with fixture databases for stock entry operations, error states, undo and keyboard workflows.
2. Bring existing translations, user preferences and permissions into the bootstrap/client shell.
3. Migrate full tasks CRUD and master data forms, including custom fields and validation.
4. Migrate shopping lists, journals, stock scanning, recipes and calendar workflows separately.
5. Switch individual entry routes only after documented parity checks pass; retain rollback links during rollout.
