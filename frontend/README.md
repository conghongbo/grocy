# Grocy React integration foundation

This project mounts a React and TypeScript page at `/react` inside Grocy's existing
Blade layout. It is an isolated integration check; no functional domain has been
migrated. The existing navigation and entry page remain unchanged.

## Build and run

From the repository root:

```sh
npm --prefix frontend ci
npm --prefix frontend run build
npm --prefix frontend run lint
```

Run Grocy normally and open `/react` under its configured base URL (or
`/index.php/react` when URL rewriting is disabled). Click the integration check
button to confirm React interaction. Unauthenticated visitors use Grocy's existing
login flow, subject to the configured authentication mode.

Vite builds `src/main.tsx` into `public/react`, including `.vite/manifest.json`.
Deploy the entire generated directory with Grocy. Generated assets are ignored by
Git; the frontend build is an explicit deployment step. The build clears only
`public/react`. Without a manifest, the page shows a build instruction instead of
loading missing assets.

For editing within Grocy, run `npm --prefix frontend run build -- --watch` and
reload the Grocy page. `npm --prefix frontend run dev` provides a standalone
component preview; it does not provide Grocy's shell or authentication. HMR inside
Grocy and `vite preview` for the production entry-only build are not supported.

## Integration decisions

- `/react` is a normal UI route through the existing authentication middleware.
  It renders through `SystemController` and `BaseController::RenderPage`, retaining
  the Blade shell, session handling, user settings, and permission-aware navigation.
- The page uses the existing `pageScripts` and `pageStyles` stacks. Only this page
  omits the automatic legacy `viewjs` script, because it has no legacy page script.
- The Vite manifest supplies the hashed entry and any entry CSS; Grocy's resource
  URL helper supports configured base paths and disabled URL rewriting. Relative
  Vite asset URLs support subdirectory deployment.
- React owns only `#grocy-react-root`. It uses existing Bootstrap classes and does
  not import the starter's global CSS, avoiding changes to the legacy shell.
- No SPA router, alternate backend, database changes, API keys, API client, new
  permission system, or functional domain components are introduced. Future API
  calls must use Grocy's existing authentication and backend permission checks.
- The current build has one entry and no code splitting. If future entries import
  extracted shared CSS, manifest dependency traversal will need to be added.

## Reproducible validation

Requirements: Node.js 24.15+ (validated with 24.19.0), npm, PHP 8.5+ with Grocy's
required extensions, and installed Composer dependencies in `packages/`. Frontend
test tools are development dependencies pinned by `package-lock.json`.

From the repository root:

```sh
npm ci --prefix frontend
npm run typecheck --prefix frontend
npm test --prefix frontend
npm run lint --prefix frontend
npm run validate:runtime --prefix frontend
php -l frontend/scripts/runtime-router.php
php -l controllers/SystemController.php
php -l routes.php
git diff --check
```

`typecheck` checks the referenced app and Vite configuration TypeScript projects.
`test` uses Node's test runner, tsx, jsdom, and React Testing Library. Its three
checks exercise the counter interaction, the entry point on a legacy page without
a mount, and the entry point mounting an interactive component while preserving
surrounding shell content.

`validate:runtime` first builds the production assets, then creates a fresh
OS-temporary fixture for each of two base paths (`/` and `/fixture`). It binds PHP
only to `127.0.0.1` on an automatically selected port. `PHP_BINARY` can select a
specific PHP executable. The command requires permission to bind loopback sockets;
it fails rather than silently skipping validation when prerequisites are missing.

The fixture runner does **not** copy or load the installation's `data/`, config,
database, setting overrides, or `embedded.txt`. It filters inherited `GROCY_*`
environment settings and generates a production-mode config with normal default
authentication enabled. Its test-only router explicitly sets `GROCY_DATAPATH` to
the generated directory and runs the existing prerequisite checker and `app.php`.
It serves existing public assets without changing them. There are no changes to
the production PHP entry point, middleware, schema, or authentication behavior.

Initial requests allow Grocy to invalidate its fresh view cache and run its normal
schema migrations. Those migrations create the fixture's default admin user. The
runner then checks:

- anonymous `/react` redirects to `/login`, and `/login` renders with HTTP 200;
- posting fixture credentials creates a real session through existing auth;
- authenticated `/react` renders the Blade shell and React mount with its manifest
  module URL, without a nonexistent legacy React page script;
- the production JavaScript URL responds with the correct content type and bytes
  matching the built bundle (and entry CSS is served if present);
- the legacy Tasks page still renders its legacy script without React assets;
- logout invalidates access to `/react` for that session.

Each PHP process is stopped and its temporary database, config, and view cache
are deleted in `finally`, including assertion failures. Fixture admin credentials
are used only for the loopback validation process. The harness is for automated
local checks, not a deployment server.

## Results and limits

Passed the commands above: typecheck; all three frontend tests; lint; production
build; runtime assertions at both base paths; PHP syntax checks; and diff checks.
The prior focused Blade compiler checks also passed. Reviewed
`docs/architecture.md` and `docs/baseline.md`; the baseline's startup/build metadata
still contains placeholders.

The copied-data `/login` self-redirect did not reproduce with either fresh fixture.
The harness intentionally regenerates config and cache, so it does not diagnose
that copied environment or assume an integration defect.

HTTP runtime assertions validate routing, login/session behavior, rendered HTML,
and production asset delivery. React interactions run in jsdom against source
modules; a real-browser production JavaScript/visual test has not been added.
The legacy Tasks assertion checks page rendering only, not domain operations or a
full legacy regression suite. The missing-build fallback was checked in the first
iteration but is not covered by this runtime harness. No live database is used or
modified. No domain migration is included.
