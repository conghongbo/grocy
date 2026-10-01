# Grocy React frontend

Opt-in React 19 and strict TypeScript interface over the existing PHP REST API.

From `frontend/`:

```sh
npm ci
npm run build
npm run lint
npm test
```

The production build writes `public/react/app.js` and `app.css`. Open `/react` through the existing Grocy installation after its normal database initialization. PHP renders only a small bootstrap shell and provides API and legacy URLs through the existing UrlManager, including subdirectory and disabled URL rewriting installations. Existing session authentication and API permission checks remain authoritative. No API key is stored in the browser.

For development, run `GROCY_BACKEND_URL=http://localhost:8080 npm run dev`. The proxy forwards `/api` to PHP. Use a development backend; login cookies from another origin may need an appropriate local proxy setup. Production uses the existing same-origin session.

## Current coverage

- Stock: searchable active products, amounts, opened amounts, due dates, default locations, purchase, consume, open.
- Inventory: product counts including out-of-stock products, explicit location, optional best-before date.
- Tasks: current tasks, category and assignment, completion, undo.
- Chores: current schedules and assignments, execution time, skip, undo.
- Batteries: current schedule, rechargeable battery tracking, execution time, undo.
- Shared: navigation via URL hash, loading and API errors, refresh, canceled stale reads, mutation feedback, responsive tables, accessible native forms.

Mutation errors remain visible and do not clear form input. Inventory counts apply using the existing endpoint's location semantics; use legacy inventory for entry-level or advanced options. Amounts are in stock units. Undo is offered for the most recent successful activity action on the current page. Stock transaction undo remains in the legacy journal.

## Remaining parity work

This is an incremental migration, not full replacement. Legacy pages remain available at their original routes and through React links. Record create/edit/delete forms, completed task history, userfields, journals, recipes, meal planning, shopping lists, reports, scanner/camera support, rich text, printing, user settings, translated strings, date/number formatting and detailed permission-aware controls need subsequent migration. Backend permissions reject unauthorized mutations; the preview currently shows action controls regardless of user permissions. Feature flags hide disabled modules.

`src/api/client.ts` owns transport and errors; `src/api/grocy.ts` owns typed endpoint contracts; hooks own request lifecycle; pages own rendering. Add a typed endpoint and a page incrementally. Do not bypass service endpoints with generic entity writes for stock or execution records.

Client tests require Node 24 (native TypeScript stripping). Integration testing must use an isolated database; see `docs/migration.md` for the validation record.
