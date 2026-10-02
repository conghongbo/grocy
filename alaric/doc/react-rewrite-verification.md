# Grocy React rewrite verification matrix

This is a planned verification document, not a record of passing application tests. See the [implementation plan](react-rewrite-plan.md), [route catalogue](react-api-route-catalogue.md), [schema dictionary](react-api-schemas.md) and [legacy route map](react-legacy-route-map.md). Static inventory and schema checks performed during analysis do not establish runtime behavior.

## Environment and evidence procedure

Use a disposable copy or synthetic fixture database in an isolated Grocy deployment. Keep local source version, migrations, authentication class, feature flags, locale, timezone and user settings identical for the legacy and React comparisons. Never test mutating endpoints or printers against the public demo or household data. Stub webhook/printer/plugin destinations where needed and retain a separate hardware smoke test.

For every route below, record date, source commit, fixture/setup, auth/role, feature flags, exact method/path/query/body, status, headers, redacted response, records/logs before and after, legacy outcome, React outcome and verdict. Do not store passwords, API keys or iCal secret URLs in evidence. Use explicit observed values rather than assuming the OpenAPI example was returned.

Four baseline scenarios apply to every operation: successful input; missing/invalid path or body/query where applicable; authentication failure; backend/network failure. Add permission denial for each explicit permission, empty-list/null data for reads, and uncertain completion/retry recovery for writes. Test authenticated routes under default auth, not only dev/demo bypass. Distinguish planned, executed/pass, executed/fail and blocked; initial status for all application scenarios is planned.

## Cross-module acceptance cases

| ID | Scenario | Expected invariant or comparison | Gate |
| --- | --- | --- | --- |
| V01 | Default login, wrong credentials, remember login, expiry, logout; configured external authentication | Existing redirects/session behavior preserved; no invented JSON login; no data retained between accounts | P0 |
| V02 | Install at root and subdirectory; refresh deep links and embedded returnto links | Correct API/assets/login URLs; no HTML mistaken for JSON; initialization/migrations still reachable | P0 |
| V03 | Missing key, invalid key, key plus session, iCal secret on permitted and unrelated routes | Default auth precedence matches source; special key cannot authenticate unrelated routes | P0/P7 |
| V04 | Least-privilege user, self-edit versus other-user edit, permission tree changes during session | Navigation and actions match resolved capabilities; actual 400/403 differences handled; selector access does not require new admin rights | P0/P8 |
| V05 | Exact JSON header, charset suffix, malformed/empty body, {}, booleans and arrays | Actual sanitizer/parser behavior recorded; errors readable; no unconditional JSON parse on 204 | P0 |
| V06 | Q filters, repeated conditions, null, regexp, order, limit/offset, invalid fields/sort and unsupported Q routes | Lists/results match handler behavior; no fictional count/cursor; regex/runtime function limits recorded | P0 |
| V07 | Network loss before send versus after server write; slow response; double-click | One explicit command; no blind retries, duplicate bookings or misleading success; reconciliation offered | All |
| V08 | Two clients change data and settings; DB changed-time changes while form dirty | Dependent lists refresh; unsaved form not silently overwritten | All |
| V09 | All locales used in deployment, RTL, plural quantities, decimal separator, currency and date display | Ordinary and quantity-unit translations preserved; numeric serialization stays backend-compatible | P0/P3 |
| V10 | Server/client timezone mismatch, DST boundary, date-only and invalid T/Z timestamps, unknown/never dates | No day shift; backend-local execution times match intent; fallback-to-now behavior known | All |
| V11 | Feature flags disabled individually, active/inactive master records | Hidden features remain hidden; editing retained historical references works; no missing selector crashes | All |
| V12 | Every custom field type, null/empty/false/zero, options/order, userentity sidebar and object lifecycle | Source stored representation and display preserved; separate field save failure recoverable without duplicate object | P1/P8 |
| V13 | Binary upload, Unicode/Base64 filename, download alias, image resizing, missing file, overwrite attempt | Raw bytes preserved; correct MIME/Content-Disposition; duplicate filename rejected and reference not corrupted | P2 |
| V14 | Task create/edit/delete, optional assignee/category/date, complete/undo, include completed, overdue/today/soon | Current API excludes done; all-list adapter includes it; due presentation and stored timestamp match old UI | P1 |
| V15 | Battery charge, non-rechargeable rejection, charge-cycle custom fields, undo twice | Log ID used for undo; repeated undo fails; record actual is_charged behavior after undo | P2 |
| V16 | Replace rechargeable and disposable batteries; same ID, nonexistent, inactive, used, uncharged replacement | Two-row transition matches service; failures leave transaction unchanged; no fictional replacement undo | P2 |
| V17 | Equipment create/edit/delete with manual and custom files | Upload/reference/download behavior and partial-failure handling match existing form | P2 |
| V18 | Product/group/location/store/unit/conversion/barcode CRUD including inactive records and custom fields | Defaults/relations/cascades match migration and form rules; conversion diagnostics preserved | P3 |
| V19 | Purchase in alternate units; tare product gross weight; price-unit conversion; stock labels | Posted amount and value correct; due date follows defaults; label count/mode matches configuration | P3 |
| V20 | Consume exact/partial entry, location, spoiled, parent/child substitution, insufficient stock | Correct entry/log/quantity changes; known transaction_type spelling discrepancy captured | P3 |
| V21 | Open partial/unopened quantity, disabled opening, tare product, shelf-life after opening | Entry split and new due date match service; disallowed cases show error | P3 |
| V22 | Transfer partial stock between freezer/non-freezer locations; invalid locations/shortage | Source/destination logs and freeze/thaw dates reconcile; no client-side double calculation | P3 |
| V23 | Inventory greater/less/equal quantity, stock entry edit preserving open/date/note/price | Appropriate adjustment logs; equal-quantity behavior documented; omitted edit fields not accidentally cleared | P3 |
| V24 | Booking undo, whole transaction undo, repeated undo and subsequent dependent booking | Correct IDs used; dependent history restrictions respected; stock and correlated logs reconcile | P3 |
| V25 | Product merge with invalid/same/inactive IDs and related recipe/shopping/barcode records | Only valid merge succeeds; removed references/joins refresh consistently | P3 |
| V26 | Keyboard scanner, camera denial/recovery, leading-zero barcode, Grocycode entry data, external lookup with add | Correct product/entry/defaults; no accidental repeat command; plugin failure and duplicate product recoverable | P3 |
| V27 | Multiple shopping lists, free text, product aggregation, checked flag, add/remove/clear checked-only, missing/overdue/expired | Quantities and selected list correct; free text not sent to product-only command; shopping setting effects preserved | P4 |
| V28 | Shopping-to-purchase handoff, return navigation, unit/note defaults, browser and thermal printing | No lost context; UI and paper content match old workflow; printer failure does not repeat purchase | P4 |
| V29 | Every chore period/assignment type, date-only execution, skip/manual skip, reschedule, execute as user, calculate one/all assignments | Next due/assignee/history matches service; forbidden/invalid cases handled; settings and source statistics preserved | P5 |
| V30 | Chore stock consumption, execution field save failure, undo and merge with history | Stock side effects and partial failures recorded; undo does not imply unimplemented stock restoration | P5 |
| V31 | Recipe CRUD/positions/nestings, images/rich text, desired servings, ingredient groups, variable/optional ingredients | Resolved amounts/cost/calories and nested presentation match; no double scaling or writes of computed fields | P6 |
| V32 | Recipe copy, missing-products exclusions, consume and self-production, insufficient stock | Created ID returned; correct logs/list changes; reconcile partial failures instead of retrying blindly | P6 |
| V33 | Meal recipe/product/note entries, sections, move/copy/delete across days/weeks | Internal/shadow recipe mapping and fulfillment match PHP controller; all entry types preserved | P6 |
| V34 | Meal-plan requirements ranges, reversed/invalid date, list ID, strict boolean, minimum stock, existing shopping quantities and missing conversions | Requirements/written_items units correct; atomic service behavior on failure; repeated request does not blindly duplicate need | P6 |
| V35 | Calendar all event types, all-day/timed/null dates, settings/colors and links | Events match CalendarService; iCal not substituted for missing JSON metadata | P7 |
| V36 | iCal sharing link creation/reuse, download MIME, chore mark/skip via secret | Correct key owner permissions, localized status/action descriptions; no prefetch-triggered completion | P7 |
| V37 | Journal ranges and summaries, spending by product/group/store, ungrouped filter, self-production exclusion | Totals reconcile with controller SQL and legacy report; no omissions from pagination or price-only history | P7 |
| V38 | Location sheet including out-of-stock/default locations and print | Same products/locations/quantities and paper layout | P7 |
| V39 | User create/edit/password Base64/self-other/delete, pictures, assignments, demo forced-admin branch | Actual service constraints preserved; credentials never exposed in UI or evidence | P8 |
| V40 | API keys owner/admin list, create/description/delete and special-purpose keys | Ownership of proposed adapters matches intended policy; generic route deletion behavior explicitly reviewed | P8 |
| V41 | Setting set/get/delete-to-default, every module settings screen, import of existing settings | Persisted values affect forms/lists correctly; all old control keys represented | P8 |
| V42 | Rich text, embedded iframe forms, custom CSS/JS hooks, notifications, focus, tab/keyboard/mobile flows | User workflows remain usable; compatibility limitations resolved before route retirement | All/P8 |
| V43 | Label webhook browser/server mode, copies/repetitions, binary Grocycode/stock-entry label, thermal printer | One requested output per action; correct returned data and execution side; failed print never repeats business write | P2/P3/P4/P6 |
| V44 | About/changelog, API docs, manifest, scanner/plural/conversion diagnostics | Utility routes remain accessible and functional after SPA routing changes | P8 |
| V45 | Switch module back to legacy after React writes; navigate every legacy bookmark | Same backend data readable; no schema rollback needed; all 83 route dispositions accounted for | Cutover |

## Route execution checklist

Every API route gets its own evidence record below, in addition to module-level scenarios. Apply the four baseline scenarios and the exact request, permission and error distinctions in the catalogue. Do not invent invalid-ID errors on handlers that return null or empty arrays. OPTIONS has its own browser preflight check.

| Route ID | Method and path | Evidence/status |
| --- | --- | --- |
| [A001](react-api-route-catalogue.md#a001) | `GET /api/openapi/specification` | Planned |
| [A002](react-api-route-catalogue.md#a002) | `GET /api/system/info` | Planned |
| [A003](react-api-route-catalogue.md#a003) | `GET /api/system/time` | Planned |
| [A004](react-api-route-catalogue.md#a004) | `GET /api/system/db-changed-time` | Planned |
| [A005](react-api-route-catalogue.md#a005) | `GET /api/system/config` | Planned |
| [A006](react-api-route-catalogue.md#a006) | `POST /api/system/log-missing-localization` | Planned |
| [A007](react-api-route-catalogue.md#a007) | `GET /api/system/localization-strings` | Planned |
| [A008](react-api-route-catalogue.md#a008) | `GET /api/objects/{entity}` | Planned |
| [A009](react-api-route-catalogue.md#a009) | `GET /api/objects/{entity}/{objectId}` | Planned |
| [A010](react-api-route-catalogue.md#a010) | `POST /api/objects/{entity}` | Planned |
| [A011](react-api-route-catalogue.md#a011) | `PUT /api/objects/{entity}/{objectId}` | Planned |
| [A012](react-api-route-catalogue.md#a012) | `DELETE /api/objects/{entity}/{objectId}` | Planned |
| [A013](react-api-route-catalogue.md#a013) | `GET /api/userfields/{entity}/{objectId}` | Planned |
| [A014](react-api-route-catalogue.md#a014) | `PUT /api/userfields/{entity}/{objectId}` | Planned |
| [A015](react-api-route-catalogue.md#a015) | `PUT /api/files/{group}/{fileName}` | Planned |
| [A016](react-api-route-catalogue.md#a016) | `GET /api/files/{group}/{fileName}` | Planned |
| [A017](react-api-route-catalogue.md#a017) | `DELETE /api/files/{group}/{fileName}` | Planned |
| [A018](react-api-route-catalogue.md#a018) | `GET /api/users` | Planned |
| [A019](react-api-route-catalogue.md#a019) | `POST /api/users` | Planned |
| [A020](react-api-route-catalogue.md#a020) | `PUT /api/users/{userId}` | Planned |
| [A021](react-api-route-catalogue.md#a021) | `DELETE /api/users/{userId}` | Planned |
| [A022](react-api-route-catalogue.md#a022) | `GET /api/users/{userId}/permissions` | Planned |
| [A023](react-api-route-catalogue.md#a023) | `POST /api/users/{userId}/permissions` | Planned |
| [A024](react-api-route-catalogue.md#a024) | `PUT /api/users/{userId}/permissions` | Planned |
| [A025](react-api-route-catalogue.md#a025) | `GET /api/user` | Planned |
| [A026](react-api-route-catalogue.md#a026) | `GET /api/user/settings` | Planned |
| [A027](react-api-route-catalogue.md#a027) | `GET /api/user/settings/{settingKey}` | Planned |
| [A028](react-api-route-catalogue.md#a028) | `PUT /api/user/settings/{settingKey}` | Planned |
| [A029](react-api-route-catalogue.md#a029) | `DELETE /api/user/settings/{settingKey}` | Planned |
| [A030](react-api-route-catalogue.md#a030) | `GET /api/stock` | Planned |
| [A031](react-api-route-catalogue.md#a031) | `GET /api/stock/entry/{entryId}` | Planned |
| [A032](react-api-route-catalogue.md#a032) | `PUT /api/stock/entry/{entryId}` | Planned |
| [A033](react-api-route-catalogue.md#a033) | `GET /api/stock/volatile` | Planned |
| [A034](react-api-route-catalogue.md#a034) | `GET /api/stock/products/{productId}` | Planned |
| [A035](react-api-route-catalogue.md#a035) | `GET /api/stock/products/{productId}/entries` | Planned |
| [A036](react-api-route-catalogue.md#a036) | `GET /api/stock/products/{productId}/locations` | Planned |
| [A037](react-api-route-catalogue.md#a037) | `GET /api/stock/products/{productId}/price-history` | Planned |
| [A038](react-api-route-catalogue.md#a038) | `POST /api/stock/products/{productId}/add` | Planned |
| [A039](react-api-route-catalogue.md#a039) | `POST /api/stock/products/{productId}/consume` | Planned |
| [A040](react-api-route-catalogue.md#a040) | `POST /api/stock/products/{productId}/transfer` | Planned |
| [A041](react-api-route-catalogue.md#a041) | `POST /api/stock/products/{productId}/inventory` | Planned |
| [A042](react-api-route-catalogue.md#a042) | `POST /api/stock/products/{productId}/open` | Planned |
| [A043](react-api-route-catalogue.md#a043) | `POST /api/stock/products/{productIdToKeep}/merge/{productIdToRemove}` | Planned |
| [A044](react-api-route-catalogue.md#a044) | `GET /api/stock/products/by-barcode/{barcode}` | Planned |
| [A045](react-api-route-catalogue.md#a045) | `POST /api/stock/products/by-barcode/{barcode}/add` | Planned |
| [A046](react-api-route-catalogue.md#a046) | `POST /api/stock/products/by-barcode/{barcode}/consume` | Planned |
| [A047](react-api-route-catalogue.md#a047) | `POST /api/stock/products/by-barcode/{barcode}/transfer` | Planned |
| [A048](react-api-route-catalogue.md#a048) | `POST /api/stock/products/by-barcode/{barcode}/inventory` | Planned |
| [A049](react-api-route-catalogue.md#a049) | `POST /api/stock/products/by-barcode/{barcode}/open` | Planned |
| [A050](react-api-route-catalogue.md#a050) | `GET /api/stock/locations/{locationId}/entries` | Planned |
| [A051](react-api-route-catalogue.md#a051) | `GET /api/stock/bookings/{bookingId}` | Planned |
| [A052](react-api-route-catalogue.md#a052) | `POST /api/stock/bookings/{bookingId}/undo` | Planned |
| [A053](react-api-route-catalogue.md#a053) | `GET /api/stock/transactions/{transactionId}` | Planned |
| [A054](react-api-route-catalogue.md#a054) | `POST /api/stock/transactions/{transactionId}/undo` | Planned |
| [A055](react-api-route-catalogue.md#a055) | `GET /api/stock/barcodes/external-lookup/{barcode}` | Planned |
| [A056](react-api-route-catalogue.md#a056) | `GET /api/stock/products/{productId}/printlabel` | Planned |
| [A057](react-api-route-catalogue.md#a057) | `GET /api/stock/entry/{entryId}/printlabel` | Planned |
| [A058](react-api-route-catalogue.md#a058) | `POST /api/stock/shoppinglist/add-missing-products` | Planned |
| [A059](react-api-route-catalogue.md#a059) | `POST /api/stock/shoppinglist/add-overdue-products` | Planned |
| [A060](react-api-route-catalogue.md#a060) | `POST /api/stock/shoppinglist/add-expired-products` | Planned |
| [A061](react-api-route-catalogue.md#a061) | `POST /api/stock/shoppinglist/clear` | Planned |
| [A062](react-api-route-catalogue.md#a062) | `POST /api/stock/shoppinglist/add-product` | Planned |
| [A063](react-api-route-catalogue.md#a063) | `POST /api/stock/shoppinglist/remove-product` | Planned |
| [A064](react-api-route-catalogue.md#a064) | `POST /api/recipes/mealplan/add-shopping-requirements` | Planned |
| [A065](react-api-route-catalogue.md#a065) | `POST /api/recipes/{recipeId}/add-not-fulfilled-products-to-shoppinglist` | Planned |
| [A066](react-api-route-catalogue.md#a066) | `GET /api/recipes/{recipeId}/fulfillment` | Planned |
| [A067](react-api-route-catalogue.md#a067) | `POST /api/recipes/{recipeId}/consume` | Planned |
| [A068](react-api-route-catalogue.md#a068) | `GET /api/recipes/fulfillment` | Planned |
| [A069](react-api-route-catalogue.md#a069) | `POST /api/recipes/{recipeId}/copy` | Planned |
| [A070](react-api-route-catalogue.md#a070) | `GET /api/recipes/{recipeId}/printlabel` | Planned |
| [A071](react-api-route-catalogue.md#a071) | `GET /api/chores` | Planned |
| [A072](react-api-route-catalogue.md#a072) | `GET /api/chores/{choreId}` | Planned |
| [A073](react-api-route-catalogue.md#a073) | `POST /api/chores/{choreId}/execute` | Planned |
| [A074](react-api-route-catalogue.md#a074) | `POST /api/chores/executions/{executionId}/undo` | Planned |
| [A075](react-api-route-catalogue.md#a075) | `POST /api/chores/executions/calculate-next-assignments` | Planned |
| [A076](react-api-route-catalogue.md#a076) | `GET /api/chores/{choreId}/printlabel` | Planned |
| [A077](react-api-route-catalogue.md#a077) | `POST /api/chores/{choreIdToKeep}/merge/{choreIdToRemove}` | Planned |
| [A078](react-api-route-catalogue.md#a078) | `GET /api/print/shoppinglist/thermal` | Planned |
| [A079](react-api-route-catalogue.md#a079) | `GET /api/batteries` | Planned |
| [A080](react-api-route-catalogue.md#a080) | `GET /api/batteries/{batteryId}` | Planned |
| [A081](react-api-route-catalogue.md#a081) | `POST /api/batteries/{batteryId}/charge` | Planned |
| [A082](react-api-route-catalogue.md#a082) | `POST /api/batteries/{batteryId}/replace` | Planned |
| [A083](react-api-route-catalogue.md#a083) | `POST /api/batteries/charge-cycles/{chargeCycleId}/undo` | Planned |
| [A084](react-api-route-catalogue.md#a084) | `GET /api/batteries/{batteryId}/printlabel` | Planned |
| [A085](react-api-route-catalogue.md#a085) | `GET /api/tasks` | Planned |
| [A086](react-api-route-catalogue.md#a086) | `POST /api/tasks/{taskId}/complete` | Planned |
| [A087](react-api-route-catalogue.md#a087) | `POST /api/tasks/{taskId}/undo` | Planned |
| [A088](react-api-route-catalogue.md#a088) | `GET /api/calendar/ical` | Planned |
| [A089](react-api-route-catalogue.md#a089) | `GET /api/calendar/ical/sharing-link` | Planned |
| [A090](react-api-route-catalogue.md#a090) | `GET /api/calendar/ical/chores/{choreId}/mark-as-done` | Planned |
| [A091](react-api-route-catalogue.md#a091) | `GET /api/calendar/ical/chores/{choreId}/skip` | Planned |
| [AOPT](react-api-route-catalogue.md#aopt) | `OPTIONS /api/{routes:.+}` | Planned; authenticated and unauthenticated browser preflight |

## Full functionality signoff

For every row of the legacy route map, record one final disposition: React replacement verified; intentionally retained backend output verified (authentication, documentation or binary/export); or incomplete. Link the matching scenarios and evidence. Retaining an unported application page is a safe interim fallback, not full React completion. The release gate requires zero incomplete entries, every API route accounted for, all proposed server adapters verified, and local extensions covered.
