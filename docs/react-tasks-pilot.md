# React Tasks experimental pilot

## Scope and activation

Only the integration foundation and Tasks pilot are implemented. PHP/Slim routing,
authentication, existing REST controllers/services, SQLite, Blade navigation and
all other domains remain in place. `/tasks`, `/task/{id}`, `/taskcategories`, and
`/taskcategory/{id}` select React when enabled. `/taskssettings` stays on Blade.

Build with `npm ci --prefix frontend` and `npm run build --prefix frontend`.
The build writes `public/react/.vite/manifest.json` and hashed JS/CSS. Include the
whole `public/react` directory in deployment artifacts. No Node server is needed
in production. Enable with `Setting('REACT_TASKS', true);` in `data/config.php`,
or `GROCY_REACT_TASKS=true`. The default is **false**.

Disable the setting for complete rollback. `?legacy=1` selects Blade for one page;
the Legacy link preserves its query parameters. Missing, malformed, or incomplete
production manifests fall back to Blade. Original templates/scripts are retained.
An asset request failing after page rendering still requires the Legacy link;
there is no automatic replay of a partially completed mutation.

## Integration boundaries

- Blade owns the shell; React owns `#grocy-react-root`. Legacy page/component
  scripts are not loaded on React pages. Shared dirty-input and focus handlers
  skip the root. React forms expose `form.is-dirty` to the existing automatic
  database-refresh guard and warn on unsaved navigation.
- PHP constructs route, API and resource bases independently through UrlManager.
  The asset manifest selects hashed bundles; Vite uses relative asset references.
- JSON bootstrap is escaped against script termination. It provides page identity,
  relevant feature flag, locale/currency, settings, permissions and safe user DTOs.
  Existing gettext catalogs, plurals, direction and theme stay in the shell.
- Session-cookie requests reuse current browser authentication. API transport
  handles JSON, empty 204, structured/non-JSON errors, cancellation, and login
  redirects. No API key is stored and mutations are not automatically retried.
- `/api/tasks` remains the source of current tasks. Generic task records enrich
  it with userfields; generic objects provide completed tasks and category CRUD.
  Completion/undo use domain endpoints, not generic writes. Completion sends the
  browser-local timestamp, preserving the legacy booking time convention.
- The server supplies user DTOs because `/api/users` requires USERS_READ while
  legacy task controllers supply assignees without that permission.
- Existing iframe dialogs and Reload messages remain compatible. Task/category
  forms include native inputs and dynamic userfields, including file uploads.
  Creates remember the returned ID if follow-up saves fail, avoiding a second
  create on retry. Uploaded files are reused on retry; old files are deleted only
  after their replacement reference has been saved.
- React tables retain existing DataTables setting keys, translate reordered sort/
  visibility state, and support column movement, visibility, grouping/collapse,
  sorting and resettable filters. Today remains included in due-soon.

## Reproducible checks

Use an isolated copy, never the live database:

```sh
php test/PrepareReactPilot.php /tmp/grocy-react-pilot-new
GROCY_DATAPATH=/tmp/grocy-react-pilot-new GROCY_REACT_TASKS=true php -S 127.0.0.1:8098 -t public
```

The fixture login is `pilot-admin` / `pilot-test-password`. `pilot-reader` uses the
same password and has no mutation permissions. These credentials exist only in
the temporary copy. The preparation script refuses an existing destination or a
destination outside the system temporary directory.

```sh
npm run typecheck --prefix frontend
npm run lint --prefix frontend
npm test --prefix frontend
npm run build --prefix frontend
php test/ReactAssetsTest.php
php test/IcalChoreDescriptionServiceTest.php
node frontend/tests/integration.mjs
```

Integration checks are restricted to loopback ports 8098/8099. They exercise
session authentication, unauthorized requests, production assets/content types,
legacy rendering, scope isolation, task/category CRUD, completion/undo, custom
fields, persisted settings, and restricted-user denial. They create disposable
records in the temporary database, and modify its table settings.

## Verification performed

- Strict TypeScript, lint without warnings, four Node unit tests, production build,
  asset-loader PHP tests, existing iCal PHP test, PHP syntax checks and diff
  whitespace checks passed.
- HTTP integration passed at root and at `/grocy/index.php` with URL rewriting
  disabled. Asset URLs used `/grocy/react/assets/...`, not `/react/...`.
- Browser verification passed: normal login, React overview, embedded task create/
  edit, due-date save, required custom-field save and displayed column, completion,
  undo, due-soon including today, category create/disable/show-disabled, persisted
  grouping. A fresh final tab had no console errors.
- Early verification failures were corrected: initial test-server static-file
  routing, conflicting temporary caches between URL configurations, form dirty
  state timing, date input events, and custom-field enrichment of current tasks.

## Remaining limits and deviations

- The pilot uses native React tables and form controls rather than matching the
  customized legacy Tasks appearance pixel for pixel. Column movement uses
  buttons rather than DataTables drag gestures. No client-side SPA router is used.
- Runtime-validated hand-authored task DTOs are used; comprehensive OpenAPI type
  generation is deferred because the specification includes runtime-generated
  entity schemas. Generic list validation is intentionally limited to list/row
  shape; stronger per-field contract validation remains future work.
- Full browser coverage of all userfield types/file failure paths, RTL, themes,
  mobile breakpoints, alternative authentication, custom scripts, high-volume
  performance and all server/browser timezone combinations has not been completed.
  Binary upload behavior is implemented but not browser-verified in this run.
- No automated component-test runner or automated browser suite was added. Browser
  verification was performed through the connected browser; Node and HTTP checks
  are reproducible scripts.
- Backend stock/services/database schema are unchanged. No new REST endpoints,
  database migrations or later-domain migration work were introduced.
- Existing auth middleware may redirect unauthorized prefixed API URLs to login
  instead of returning 401; the client recognizes the login redirect. This backend
  behavior is preserved.
- If a create succeeds but its response is lost, the API offers no idempotency key;
  manually resubmitting may duplicate it. A failed upload/reference save can leave
  an unreferenced uploaded file. No broader backend transaction changes were made.

The experimental switch should remain opt-in until the remaining compatibility
matrix has been reviewed and tested on the intended deployment.

## Changed-file manifest

```text
config-dist.php
controllers/BaseController.php
controllers/TasksController.php
docs/react-tasks-pilot.md
frontend/package.json
frontend/src/App.tsx
frontend/src/api/client.ts
frontend/src/api/tasks.ts
frontend/src/app/context.ts
frontend/src/compat/forms.ts
frontend/src/features/tasks/FieldValue.tsx
frontend/src/features/tasks/Overview.tsx
frontend/src/features/tasks/TaskForm.tsx
frontend/src/features/tasks/Userfields.tsx
frontend/src/features/tasks/layout.ts
frontend/src/features/tasks/status.ts
frontend/src/index.css
frontend/src/main.tsx
frontend/tests/client.test.ts
frontend/tests/integration.mjs
frontend/tsconfig.app.json
frontend/vite.config.ts
helpers/ReactAssets.php
public/js/grocy.js
public/react/.vite/manifest.json
public/react/assets/main-CMi_dJt8.css
public/react/assets/main-DUCWeUJ0.js
test/PrepareReactPilot.php
test/ReactAssetsTest.php
views/layout/default.blade.php
views/reacttasks.blade.php
```

The pre-existing untracked `evidence/workflow-b/screenshots/` directory was not changed.
