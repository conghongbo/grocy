# Grocy React frontend — Tasks phase 1

This is a separate React/Vite application. The existing Grocy frontend and its PHP backend continue to run together on port 8080. React runs on port 5173 and forwards `/api` requests to **that same backend** through the existing Vite proxy. No Blade mounting, PHP route replacement, second database, copied API, or authentication bypass is used.

## Run both frontends

Use the project's existing PHP configuration and data directory. If these servers are already running, keep using them; do not start duplicate servers.

From the repository root, start the backend and existing frontend in one terminal:

```sh
php -S localhost:8080 -t public
```

In another terminal:

```sh
cd frontend
npm ci
npm run dev -- --port 5173 --strictPort
```

The dependency installation is only needed on a fresh checkout or after dependency changes. Use a Node version supported by Vite; the test command additionally requires Node 22.18+ with built-in TypeScript stripping and `node:sqlite` (verified here with Node 25.9.0).

1. Open `http://localhost:8080/tasks` and sign in normally.
2. In the **same browser/profile**, open `http://localhost:5173/`.
3. If React was already open at a 401 error, click **Retry** after signing in.
4. Use the existing frontend for creating, editing, completing, undoing or deleting tasks. Click **Refresh** in React to read the latest unfinished list.

Use `localhost` for both addresses, not `localhost` for one and `127.0.0.1` for the other. Browser cookies are scoped to host/path rather than port. The frontend requests its own `/api/tasks` with `credentials: 'same-origin'`; Vite forwards the existing session cookie to PHP. No API key belongs in the source code, Vite environment, URL or local storage. Cookie policy, non-root installations and separate production hostnames need their own deployment verification.

If your backend uses a different address, update the `server.proxy['/api'].target` in `vite.config.ts` to your existing backend and restart Vite. Keep both frontend processes separate. The documented setup assumes a root installation and the same hostname. A production deployment must serve the React build independently and proxy `/api` to the existing Grocy backend while preserving its session policy. This phase does not install or change a production web-server configuration.

## Implemented scope

- GET `/api/tasks`, without user filters or pagination.
- Name, date, category and assignee for every returned unfinished task.
- Explicit loading, empty, error, retry and refresh states.
- Numeric/string ID normalization, missing-relation fallbacks, escaped text and cancellation/stale-response protection.
- Dates display the API's calendar date as `YYYY-MM-DD` without UTC conversion.

The current-tasks endpoint guarantees `done = 0`. Duplicate IDs, completed rows, invalid required fields or an unexpected envelope are reported as response errors, rather than silently hiding or dropping records. Missing optional relation objects keep the task visible. Inactive/deleted relations display “Category unavailable” / “User unavailable”; unassigned values display “Uncategorized” / “Unassigned”.

Filters, summary counts, completed-task view, mutations, custom fields, categories management, settings, attachments and full legacy visual parity remain in later stages of the migration plan. The empty `api/system.ts` and `pages/HomePage.tsx` baseline files are not used by this phase.

## Verification

```sh
npm test
npm run build
npm run lint
```

Tests use Node's built-in runner, the installed Vite TSX transformer, React server rendering and an in-memory SQLite fixture built from the repository's task migration. They do not access or change your Grocy database. HTTP responses are mocked in automated client tests, and the request lifecycle tests exercise the same cleanup function used by the React effect. These are not end-to-end browser tests or a substitute for a real authenticated API comparison.

See `../alaric/doc/tasks-react-phase-1-results.md` for results, live verification and outstanding issues, and `../alaric/doc/tasks-react-migration-plan.md` for later stages.

## Local stale-route troubleshooting

If a correct `/api/tasks` request unexpectedly reports an unrelated controller (for example Batteries), compare the generated `data/viewcache/route_cache.php` mapping with current `routes.php`. The existing backend invalidates that cache using the version/base URL/base path, so route edits can leave stale identifiers. Back up and move aside **only that generated route-cache file**, then request the application again so Grocy rebuilds it. Verify both `/tasks` and `/api/tasks`. Do not rewrite the React API URL to compensate for a stale backend cache. The phase-1 results document records the confirmed local occurrence and repair.
