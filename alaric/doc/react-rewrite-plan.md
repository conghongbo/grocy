# Grocy React frontend rewrite implementation plan

The recommended approach is an incremental React replacement over the existing PHP backend, with a shared integration layer and explicit parity gates for each module. Start with authentication and shared UI infrastructure, prove the pattern with Tasks, then deliver Batteries and Equipment, Stock, Shopping Lists, Chores, Recipes and Meal Planning, and finally the cross-module Calendar and Reports. Administration and settings must be supported throughout and completed before retiring Blade.

This plan is for the architecture, frontend, backend integration and verification owners. It preserves the complete local feature set, including custom battery replacement and meal-plan shopping requirements. A frontend made only from the documented REST endpoints cannot immediately replace every existing page: several required datasets and behaviors currently come from PHP controllers, Blade templates, shared JavaScript, SQL views, and configured integrations.

## Evidence and deliverables

Analysis date: 1 October 2026, Pacific/Auckland. Baseline commit: `5555e15070c17ff0a14b8460928525c0c6a5c1b5`. Local `version.json` reports 4.6.0, release date 2026-03-06. At analysis start, `docs/react-api-implementation-guide.md` was an existing untracked file; it is preserved. It was context, not the authority for this analysis. No applicable AGENTS.md was found in the repository search.

The following documents form one implementation package:

| Document | Purpose |
| --- | --- |
| [API route catalogue](react-api-route-catalogue.md) | All **91 registered API method/path pairs**, plus the OPTIONS wildcard; request parameters, responses, permissions, errors, dependencies and local OpenAPI declarations |
| [Schema and entity dictionary](react-api-schemas.md) | All **34 exposed entity names**, CRUD restrictions, SQL columns/defaults/constraints and computed view definitions, declared response DTOs and custom response fields |
| [Legacy frontend route map](react-legacy-route-map.md) | All **83 routes outside the API group**, including HTML forms, settings, login/logout, documentation, image/label routes and diagnostics, with controller/template dependencies |
| [Verification matrix](react-rewrite-verification.md) | Route-level contract scenarios and complete module parity gates |
| [Machine-readable route inventory](react-api-route-inventory.json) | Method/path coverage and implementation references for future drift checks |

Primary evidence is [routes.php](../routes.php), [API controllers](../controllers/Api), [services](../services), [migrations](../migrations), [page controllers](../controllers), [views](../views), [view scripts](../public/viewjs), [shared browser code](../public/js/grocy.js), [configuration defaults](../config-dist.php) and [local OpenAPI](../grocy.openapi.json). Where implementation and specification differ, implementation wins. Catalogue request/response declarations are included as secondary evidence, not assumed runtime guarantees.

Verification performed for this analysis: static route/handler enumeration, source tracing, route/spec comparison, public reference downloads, and schema reconstruction by executing SQL migration files in a new in-memory SQLite database. PHP migration files were inspected; they change data/files rather than schema and were not executed. No production/local application database was opened, no application code was modified, no backend was started, and no mutation endpoint was called. Endpoint runtime, browser parity and printer behavior remain verification work, not claimed successes.

## Reference website comparison

The supplied [demo API UI](https://demo.grocy.info/api) was retrieved successfully as HTML. It points to the [demo OpenAPI specification](https://demo.grocy.info/api/openapi/specification), retrieved as JSON and reporting **4.7.1**. Initial web-tool attempts timed out; direct retrieval succeeded. The downloaded specification SHA-256 was `2d517af2840ffe40a4c6bce62eaacd71576d189c5364f0c370f686ee9e85d7c4`. The comparison is of published contracts, not demo mutation behavior or proof that every live operation conforms to its specification.

| Comparison | Finding | Implementation decision |
| --- | --- | --- |
| Shared core | Both specifications cover generic entities/files/users/settings, stock and shopping actions, recipes, chores, batteries, tasks, printing and iCal | Use the demo to understand API organization; implement against local handlers and schema |
| Demo-only declared operation | `POST /stock/products/{productId}/copy` | Not registered locally; do not call it or promise it as an existing local capability |
| Local-only declared operations | `GET /calendar/ical/chores/{choreId}/mark-as-done` and `/skip` | Preserve both local actions and generated iCal links |
| Local registered but undeclared | `POST /recipes/mealplan/add-shopping-requirements`, `POST /batteries/{batteryId}/replace`, `GET /openapi/specification` | Include in the React integration contract; first two are important local functionality |
| Dynamic generic entity declarations | Four shared GET/POST/PUT generic operation declarations differ structurally because served demo enums are expanded, while checked-in local placeholders are not | Do not infer new local entity access from demo-generated enums |
| Version and schema | Demo 4.7.1 differs from local 4.6.0; local SQL includes custom battery state/device fields beyond old DTO descriptions | No backend upgrade is implied; use local migration-derived fields and verify DTO scalar types |

The local specification has 88 method/path declarations, all registered locally; the demo has 87 declared operations. Those counts exclude the locally registered specification endpoint and CORS wildcard. Shared operation schemas alone do not prove shared service semantics. Reference content may change after this snapshot.

## Backend structure and integration boundaries

Grocy is a Slim PHP application using Blade rendering, LessQL access and SQLite tables/views/triggers. It is not a separate JSON backend with a passive HTML client. [app.php](../app.php) loads configuration and middleware; root initialization can run migrations and cache maintenance. Preserve backend initialization and upgrade behavior when adding React routing. Do not replace `/` with an unconditional SPA fallback that bypasses that lifecycle.

Two write paths must remain distinct:

1. Generic `/api/objects/{entity}` CRUD creates and edits definitions: products, recipes, task definitions, categories, shopping entries, equipment, meal-plan entries and custom objects. It passes column values to LessQL and relies on database constraints/triggers. It does not offer a universal form schema or business-action abstraction.
2. Domain actions perform stock bookings, opening, transfers, recipe consumption, chore execution, battery charging/replacement and task completion. They validate business conditions, write logs, update related data and sometimes trigger printing. Never emulate these with raw generic updates to stock or log tables.

The generic whitelist is itself read from `grocy.openapi.json`; the specification therefore participates in runtime behavior. Do not casually replace it with the demo specification or a generated React contract. Generic entity names are fixed; custom entities use `objects/userobjects` with `userentity_id`, and values under `userfields/userentity-NAME/{objectId}`. There is no generic `objects/userentity-NAME` route contract.

### Authentication and permission procedure

Use a same-origin React deployment and retain existing login/logout initially. `POST /login` accepts form fields through the configured authentication class; default auth expects username, password and stay_logged_in. It is not a JSON login endpoint. Default auth tries `GROCY-API-KEY` before a session cookie. LDAP, reverse-proxy and other configured auth classes must retain their workflows. Do not ship a shared administrator API key in browser assets.

1. Resolve the backend base URL and base path using the existing UrlManager convention. Proxy both HTML authentication and `/api` in development; verify cookie/redirect behavior under subdirectory installs.
2. Establish session through the existing login and fetch `/api/user`, settings and server time. `/api/user` returns a collection, so read the current user row explicitly.
3. Obtain effective permission data from a server-provided shell bootstrap that uses the same `User::PermissionList`/resolved policy as Blade. The current user response does not include it; `/api/users/{id}/permissions` is ADMIN-only and returns raw assignments. Do not grant a user access to that endpoint merely to render their navigation.
4. Enforce page/action visibility based on effective permissions and feature flags. Backend enforcement remains authoritative; permission-denied responses must work even after a page was loaded with permission.
5. Clear user-specific query caches and bootstrap data on logout/account changes. Treat expired session redirects/HTML responses as authentication failures rather than attempting JSON parsing.

`AuthMiddleware` recognizes API paths with a literal `/api/` prefix; subdirectory installs can expose redirect/error classification differences. CORS returns wildcard origin and lacks credential support. A separate-origin cookie SPA is not a drop-in deployment; retain same origin unless a deliberate backend CORS/auth change is agreed. Preflight also traverses global auth and must be verified.

Read the exact route permissions in the catalogue. Several API reads and some mutations have no explicit action check even though the legacy UI hides them by permission. Generic task CRUD requires MASTER_DATA_EDIT, not TASKS. Chore execution permission exceptions become 400 inside a catch; stock actions usually return global 403, but their barcode wrappers can convert it to 400. Frontend authorization must not infer permissions from a single status code or weaken server controls to populate selectors.

### Shared React integration layer

Proposed implementation structure, independent of the eventual build tool versions:

```text
frontend/src/
  app/              routing, bootstrap, layout, auth boundary, module switches
  api/              transport, errors, wire DTOs, normalization, query encoding
  components/       forms, pickers, tables, dialogs, rich text, files, barcode input
  features/
    tasks/ batteries/ equipment/ master-data/ stock/ shopping/
    chores/ recipes/ meal-plan/ calendar/ reports/ users/ settings/ userfields/
  localization/     catalogue loading, placeholders, plurals, number/date display
```

Use React with TypeScript, a router and a shared server-state cache abstraction. Select and pin actual package versions during implementation; this analysis does not claim compatibility with a particular current release. Keep domain services out of components. Each feature has wire DTOs, explicit request builders, normalization functions, query keys, mutation orchestration and presentation components. Do not expose a catch-all editable database form as the principal user experience.

Transport requirements:

- `requestJson<T>`, `requestVoid`, `downloadBlob` and `uploadBinary` are separate operations. For JSON writes set the exact `application/json` header. Treat 204 as success without decoding a body. Preserve HTTP status, error_message, optional error_details and a text fallback.
- Construct base-path-safe URLs and URL-encode path segments, including barcodes and Base64 filenames. Use repeated `query[]` parameters; do not append Q to endpoints that ignore it. Lists do not provide a total-count envelope.
- Keep date-only values as `YYYY-MM-DD`. Where required, send backend-local `YYYY-MM-DD HH:mm:ss`, not an automatic UTC `toISOString()`. Use `/system/time` for timezone/clock reconciliation. Invalid timestamps can silently become server now. Preserve sentinel due date `2999-12-31` and unknown/null values.
- Normalize numeric strings and 0/1 flags deliberately. `Boolean("0")` is wrong. Distinguish empty string, null, missing field and numeric zero. Do not round before stock-unit conversions; use configured amount/price precision at the appropriate boundary.
- Separate numeric stock row ID, stock_id string, booking ID, transaction ID, chore execution ID and battery charge-cycle ID in types. Undo acts on different identifiers in different modules.
- Do not auto-retry mutations. Some GETs mutate or print: label routes, thermal printing, external lookup with add, iCal sharing-link creation and iCal chore actions. Model them as explicit commands; disable prefetch/refetch-on-focus and ordinary read caching.
- Handle partial success: entity creation followed by userfield upload/save is not atomic. Retain the created ID, show which step failed, and retry only that step. File PUT refuses overwrites; generate a new filename, upload, update the reference, then clean up an old unreferenced file as appropriate.

Start with conservative invalidation rather than optimistic updates for business actions:

| Successful action | Refetch/invalidate |
| --- | --- |
| Task CRUD, complete/undo | Task current/all lists, task details, category/assignee display joins, calendar |
| Charge/undo/replace battery | Both affected battery details where applicable, current list, cycle journal, calendar |
| Stock add/consume/open/transfer/inventory/edit/undo/merge | Stock and volatile stock, affected product/details/entries/locations/price history, logs, shopping lists, recipe fulfillment, reports, calendar |
| Shopping writes | Selected list/entries and list summaries; recipe/meal requirements that account for shopping quantities |
| Chore execution/undo/merge/assignment change | Chore current/details/history and calendar; also stock/recipes/shopping after configured product consumption |
| Recipe or ingredient/nesting/servings change | Recipe definitions, resolved positions/fulfillment, meal-plan views and calendar |
| User settings/definitions/custom fields | Corresponding bootstrap, forms, displays and list caches; settings can affect calculation presentation and defaults |

Use `/system/db-changed-time` as a coarse signal for changes made by another client. It does not solve concurrent edit conflicts or prove that a particular mutation succeeded. Preserve unsaved forms when background data changes; offer reload/reconciliation rather than overwriting silently.

## Functionality outside API endpoints

The [legacy route map](react-legacy-route-map.md) is the page coverage checklist. The following dependencies are required work, not optional polish.

| Area | Existing behavior and evidence | Required React replacement or bridge |
| --- | --- | --- |
| Shell/navigation | BaseController and default layout inject permissions, settings, feature flags, language direction, base URL, user identity, amount precision and sidebar userentities | Add a small authenticated React host using current PHP helpers; serialize an explicit, safely escaped bootstrap DTO. Keep it while Blade page bodies are removed |
| Localization | BaseController supplies ordinary and quantity-unit PO catalogues; `__t`/`__n` implement placeholders/plurals; layout selects RTL for Hebrew | Port both catalogue paths and plural behavior, currency/energy labels and number/date formatting; generic localization API alone is insufficient for quantity-unit translations |
| Forms/pickers | `views/components` and `public/viewjs/components` implement product, recipe, user, location, store, unit/amount, dates, number, camera and custom-field components | Port keyboard focus, validation, editable versus inactive records, conversion selection, defaults, scan modes and error recovery; use typed React inputs |
| Stock overview | StockController uses uihelper_stock_current_overview rather than only GetCurrentStock; joins locations/groups/custom fields and chooses out-of-stock visibility | Reproduce joins/filters from existing API data where equivalent; otherwise expose controller-equivalent read DTO before declaring parity |
| Stock journal and summary | HTML uses uihelper views and date/product filters; summaries/undo display are not a dedicated JSON endpoint | Retain pages initially; provide server read adapters over the existing SQL calculation for grouped reports or implement equivalent, verified joins from stock_log. Never pass unexposed view names to generic API |
| Spending report | StockReportsController calculates sums by product/group/store, date range and group filter, excluding self-production | Reuse that server calculation through a proposed read adapter. Local API price histories alone are not the complete grouped report contract |
| Location content sheet | Includes formatting/printing and optional out-of-stock products at default locations | Port printable React layout and preserve GetCurrentStockLocationContent semantics; current-location entities alone omit the optional empty-product expansion |
| Tasks/Chores/Batteries | HTML controllers add due_type, current-user settings and joins; Tasks include_done is an HTML parameter; journal defaults differ (stock 6, chores 12, batteries 24 months) | Build presentation models with backend time and matching thresholds; use objects/tasks for completed tasks and log entities for history, retaining filters and undone entries |
| Recipes | HTML joins nested recipes/resolved positions and adjusts nested amounts; JS controls servings, cost/calories, grouping, pictures and rich text | Keep server fulfillment authoritative; reconstruct display grouping from resolved data or expose an equivalent read DTO. Do not double-scale nested quantities |
| Meal plan | Controller creates calendar-ready events, internal day/week/shadow recipe relations, used sections and range-based fulfillment | CRUD meal_plan via generic API; use a proposed read adapter for internal recipe/event mapping where not exposed. Preserve drag/drop, copy, servings, recipe/product/note entry types and section ordering |
| Calendar | CalendarService aggregates stock, tasks, chores, batteries and all meal entry types with localized titles, links, colors and dates, then Blade serializes it | Expose CalendarService output as a proposed JSON read adapter or keep the server bootstrap for this page until the mapping is ported. iCal is an export and does not replace the event DTO |
| Users/permissions | Blade can obtain selector users and effective permissions without using ADMIN-only assignment APIs | Bootstrap effective current-user capabilities and permitted selector DTOs. Support self edit, password changes, picture upload and permission-tree administration without broadening backend access |
| API keys | HTML list applies owner/admin filtering; `/manageapikeys/new?description=...` creates then redirects; generic api_keys listing/edit is blocked | Keep existing key page initially. Final React replacement needs owner-scoped list/create read/write adapters; retain server key generation and legacy links |
| Files/equipment | Equipment forms upload manuals through raw file API; image resizing/download names differ from JSON reads | Port upload/view/download/delete lifecycle, including recipe/product/user pictures and custom-field files/images |
| Barcode/Grocycode | Product pickers, camera scanner, keyboard scanners and code-specific entry selection; image generation through non-API Grocycode routes | Preserve barcode leading zeros, product/barcode defaults, unknown barcode lookup/creation and stock-entry extra data. Retain backend image routes or exactly reproduce documented code encoding |
| Printing | Browser print layouts, stock-entry labels, label webhooks executed on server or browser, thermal ESC/POS | Keep distinct UI commands; match label count and hook mode. Printer endpoints return webhook data or status, not a printable PDF. Preserve browser-only webhook invocation when configured |
| Custom entities/fields | Definitions/types/options/order drive arbitrary forms and sidebar items; userobject record creation and field values are separate writes | Support every UserfieldsService field type and stored representation; save metadata and values separately and recover partial failures. Do not limit this to text fields |
| General browser behavior | Shared JS supports embedded dialogs/postMessage, returnto links, focus/busy state, notifications and persisted user settings; layout loads custom_css.html/custom_js.html | Preserve links and iframe interoperability during coexistence. Define a compatibility hook contract for custom scripts; existing jQuery/DOM-dependent customizations cannot be promised unchanged without inspection |
| System utilities | About/changelog, manifest/PWA metadata, API docs, scanner testing, plural testing and resolved-conversion diagnostics are non-CRUD screens | Keep each accessible; port its user-facing behavior or retain deliberate backend-owned documentation/binary routes. A service worker/offline transactional mode is not implied |

### Proposed backend bridges

These are implementation tasks, **not existing routes**. Prefer an authenticated Blade-hosted React bootstrap first because it can reuse existing permissions and localization without creating public access. Before the final full-page cutover, implement narrowly scoped adapters for effective bootstrap/selector data, calendar events, spending/journal aggregates, meal-plan internal recipe mapping and API-key list/create. Route names and schemas must be agreed and added to backend tests/OpenAPI in those implementation changes.

For each bridge: extract the existing controller calculation into a shared read service; use it from both Blade and JSON; enforce the existing intended permission/ownership boundary; serialize only required safe DTO fields; add fixture-based parity checks; then replace the React fallback. Do not expose arbitrary SQL, uihelper view names or raw user records. If backend changes are disallowed, retain the affected legacy screen and record it as an incomplete React migration, not a completed full rewrite.

## Prioritized implementation sequence

Priorities reflect dependency order and failure impact, not just screen count. Each phase produces a usable vertical slice. No phase is complete while required fields, settings, histories, custom fields or print workflows in that slice are missing.

| Phase | Deliverable and implementation steps | Why this order and prerequisites | Exit gate |
| --- | --- | --- | --- |
| P0 | Build React host/routing, auth boundary, bootstrap, API client, normalization, error handling, localization, feature/permission gating, settings adapter and generic form/table primitives | Everything depends on these; resolve permission/selector and base-path gaps before building screens | Real-auth and subdirectory flows work; JSON/204/binary/error handling verified; legacy rollback available |
| P1 | Tasks and task categories: current/all/detail, create/edit/delete, complete/undo, category/assignee filters, due labels, custom fields, settings and embedded form return | Small domain proves CRUD plus actions and the completed/current distinction with low cross-module coupling | Full task lifecycle including completed list and restricted-user selector parity |
| P2 | File components, Batteries and Equipment: definitions, state/device display, charge/undo/replacement, history, manuals/images, labels, custom fields and settings | Reuses P1 patterns and establishes binary handling before product/recipe images; replacement exercises multi-record invalidation | Rechargeable/disposable replacement cases, history, downloads and printer branches pass |
| P3 | Stock reference data followed by core stock: locations, stores, units/conversions, groups, product/barcode definitions; then overview, details, entries, purchase, consume, open, transfer, inventory, entry edit, logs, undo, merge and labels | Products/units/stock are the dependency base for shopping, recipes and optional chore consumption; highest business risk merits a dedicated phase | Conversion/tare/freezer/expiry/subproduct/partial-entry and transaction consistency scenarios pass |
| P4 | Shopping lists: multiple lists, free-text and product entries, quantity units/notes, checked state, add/remove/clear, missing/overdue/expired commands, purchase handoff, sorting/settings and browser/thermal printing | Depends on products and conversions; establishes list semantics before recipe and meal requirements | No duplicate/lost quantities across list actions; checked-only clearing, purchase return and print parity |
| P5 | Chores: definitions/schedules/assignments, tracking/skipping/rescheduling, custom execution fields, history/undo, merge, labels, settings and stock-consumption behavior | Basic chore UI could be parallelized later by the team, but full parity requires P3 and selector bootstrap | Schedule types, assignment rotations, manual skip rejection, reschedule reset and stock effects verified |
| P6 | Recipes then Meal Planning: recipe definitions/positions/nestings/images, desired servings, fulfillment/cost/calories, missing shopping items, consume/self-production/copy; all meal entry types, sections, movement/copy and custom requirements command | Requires P3/P4; internal shadow/day/week calculations and nesting are the highest data-joining complexity | Nested/scaled quantities and stock/list effects match; preserve-minimum-stock and unit conversion errors covered |
| P7 | Calendar, location content sheets, stock summary and spending reports; finish cross-module read adapters, links, print layouts and iCal sharing/actions | Depends on stable module DTOs and source aggregate semantics; design bridges in P0 even though screens land here | Aggregates/date ranges reconcile with original UI, all event kinds and credentialed iCal links work |
| P8 | Complete users/permission administration, API-key UI, all module/user settings, custom entity/field designer, sidebar customization, about/help/docs/manifest and diagnostics; remove migrated page fallbacks | Foundational user/settings/field support already exists; this closes every legacy route and extension capability | All 83 legacy registrations have an explicit disposition and parity evidence; no required React screen depends on an unimplemented bridge |

No fixed duration is asserted without team capacity and deployment constraints. Estimate each phase after P0 fixtures expose the actual integration workload. The critical path is P0 → P3 → P4 → P6 → P7; P1/P2 establish reusable patterns, and P8 closure must not hide unresolved foundational gaps.

## Concrete module integration procedures

### Generic definition and custom-field workflow

1. Identify the entity's allowed methods, column definitions, required/default values and permission in the schema dictionary. Load its related selectors and userfield definitions before presenting a create form.
2. Port the corresponding existing form's rules and default logic. Do not treat the database's acceptance of a value as proof of equivalent UX. Preserve active/inactive list toggles and existing inactive selections on edit.
3. Build an explicit column-only payload. POST to create and store created_object_id; PUT to update a known ID. For custom userobjects use userentity_id and then the userentity-NAME field namespace.
4. Save userfields separately. If the second step fails, retain ID and entered values and offer to retry field saving rather than creating another object. Update file references only after successful binary upload.
5. Refetch the saved record and related lists, preserving filter/scroll state. Deletion must follow source UI confirmation and backend constraints; never assume cascade behavior from foreign key names alone.

### Stock transaction workflow

1. Load product details, permitted locations/stores, product entries and resolved unit conversions. Preserve barcode-specific quantity/unit/store metadata and configured product/user presets.
2. Convert the selected display/purchase/consume quantity to the units expected by the action. Productamountpicker/purchase/consume scripts are the behavioral references. Handle tare gross/net rules explicitly; do not apply tare correction twice.
3. Submit the action-specific payload from the catalogue. Stock entry edits must include open and purchased_date and preserve other intended fields. Barcode variants resolve the product and may override entry selection from Grocycode data.
4. Use the returned StockLogEntry array to obtain booking/transaction references and any post-save custom-field or label work. Avoid duplicate business mutations when a later print or field step fails.
5. Invalidate dependent state. An Undo control must call the correct booking or transaction endpoint and surface dependent-booking failures. Never delete journal rows or manually reverse quantities in React.

### Shopping, recipes and meal-plan workflow

Load list definitions and entries with products/units for shopping displays; free-text rows use generic shopping_list CRUD, while product aggregation actions use their business endpoints. Do not apply the product-only add command to a note-only entry. Preserve checked state, selected list and return-to-purchase context.

For recipes, load definitions, positions, nestings, resolved positions, unit conversions and fulfillment. Persist desired_servings where the current UI does so and then refetch fulfillment; there is no arbitrary servings query override in the handler. Use the consume endpoint for ingredient removal and self-production effects. Use the copy endpoint and returned ID, not a shallow copy of enriched recipe JSON.

For meal planning, create/update meal_plan and meal_plan_sections through generic CRUD; preserve note/product/recipe entry types. Read server-generated internal mapping through the proposed bridge when necessary. Submit `{from,to,shopping_list_id,preserve_min_stock}` to the local shopping-requirements command; render its requirement and written-item results and refresh the chosen list. Do not issue this POST as a preview: it writes. A read-only preview would need a separately designed adapter around the existing calculation service.

### Chore and battery workflow

Save definitions through generic CRUD and executions through named actions. Use returned chore-log or charge-cycle IDs for execution custom fields and undo. Chore execution can consume stock; a stock failure or subsequent UI failure must not cause blind resubmission. Treat service behavior around partial failures as an explicit verification case.

Battery replacement updates two records transactionally and has no replacement undo endpoint. Refresh both batteries and the current list. Charging and undoing a charge log are distinct from replacement; current UndoChargeCycle only marks the log undone and does not reset is_charged. Preserve existing behavior and flag it visibly in the discrepancy log rather than inventing a reverse operation.

## Known discrepancies and decisions requiring verification

| Finding | Source and impact | Required treatment |
| --- | --- | --- |
| OpenAPI omits local routes and fields | Catalogue identifies 3 missing operations; battery SQL/service has additional state fields | Add local typed adapters and contract fixtures; update backend documentation only as a separate implementation change |
| Completion/charge date-time declaration differs from parser | IsIsoDateTime accepts space-separated backend format; ISO T/Z may fall back to now | Validate frontend payload serialization against stored timestamp |
| Consume transaction override spelling | ConsumeProduct checks transaction_type but reads transactiontype | Default consume is supported; do not silently fix/work around backend semantics without a separately reviewed change |
| Due-date defaults understated in OpenAPI | AddProduct derives default date using product/freezer settings | Rely on service computation or port preview logic exactly; do not replace missing date with today universally |
| Read permissions differ from UI permissions | Effective UI permissions are not supplied by current-user API; generic reads can be broader | Use bootstrap and backend authorization as separate concerns; verify restricted roles against each module |
| Current task response is not the HTML task table | include_done and due_type are page logic | Build completed/current adapters and due presentation separately |
| Error handling is inconsistent | Missing objects, permission checks and catch placement produce 400/403/404/500 differences | Preserve actual errors in transport; do not normalize all failures into field-validation messages |
| Several responses are not JSON data reads | Raw file/iCal payloads, empty 204s, mutating GETs | Separate transport/command pathways and verify headers/body handling |
| Generic field saves are not atomic with definitions | Separate endpoints and per-field writes | Partial-success UI and targeted retries; no duplicate creates |
| No complete standalone SPA bootstrap/report API | Template-only permission, localization, aggregate and internal-relation inputs | Complete proposed bridges before claiming full React replacement |
| Demo is not an auth acceptance environment | Auth bypass and forced-admin behavior differ from deployed default auth | Verify on disposable fixtures with authentication enabled and restricted users |
| Custom scripts depend on legacy DOM | layout includes installation custom CSS/JS | Inventory actual installation hooks before cutover; provide a compatibility plan or keep affected legacy route until ported |

## Deployment and completion procedure

1. Keep PHP and its database migrations authoritative. Build React assets separately and serve them beneath the configured base path. Retain `/api`, file/image/iCal routes and backend initialization.
2. Enable migrated pages through per-module server switches; preserve old bookmarks, query parameters and embedded forms. During coexistence the router must dispatch unported routes to existing controllers. Do not redirect every unknown API/file URL to index.html.
3. Use a disposable fixture environment to capture legacy and React behavior with identical data, flags, settings, timezone and permissions. Compare user outcomes and resulting records/logs, not only screenshots or status codes.
4. Attach verification evidence to every route/module gate in the separate matrix. Close each proposed bridge and each local extension discrepancy explicitly. Maintain a route-coverage check so new backend registrations cannot disappear from the plan unnoticed.
5. Cut over one module at a time. Monitor failures and retain a server switch back to its legacy UI. UI rollback should not require rolling back database schema. Keep both clients compatible with the same backend contract during rollout.
6. Retire obsolete Blade page bodies and view scripts only after all 83 legacy routes have a verified React equivalent or an intentional backend-owned output such as binary downloads, documentation or authentication. Any still-required legacy application screen means the full rewrite is not yet complete.

Completion means functional parity across domain actions, history and undo, administration, custom entities/fields, settings, localization, permissions, feature flags, integrations, printing and diagnostics—not merely coverage of the 91 API registrations. The catalogue and verification matrix make both endpoint coverage and non-API functionality reviewable.
