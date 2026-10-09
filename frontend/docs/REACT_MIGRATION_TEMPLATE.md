# Grocy React Module Migration Template

## 1. Purpose

This document provides a repeatable process for migrating an existing
Grocy frontend module to React and TypeScript.

Before starting a new module, review:

-   `REACT_ARCHITECTURE.md`;
-   the Tasks reference implementation;
-   the Batteries reference implementation.

Do not begin by rewriting the backend. The existing Grocy REST API and
backend behaviour should be reused wherever possible.

## 2. Phase 1 - Establish the Legacy Baseline

Before changing code, document the existing module.

Record:

-   page route;
-   Blade template;
-   JavaScript files;
-   backend routes;
-   API endpoints;
-   permissions;
-   primary user workflows;
-   filters;
-   forms;
-   validation;
-   empty states;
-   error states;
-   important edge cases.

Test the legacy page before refactoring. Capture screenshots, network
requests, API responses, build/test output, and relevant source
locations where useful.

Do not assume endpoint behaviour from endpoint names alone. Verify the
existing implementation.

## 3. Phase 2 - Define the Migration Boundary

Identify what React will replace. The preferred boundary is normally
page-level frontend functionality.

React should not unnecessarily replace the PHP backend, database,
authentication, sessions, permission enforcement, server routing, or
existing services.

Example:

``` text
Keep:
PHP + Slim + DB + REST API + Blade shell

Replace:
Legacy page-level JavaScript/UI

With:
React + TypeScript
```

## 4. Phase 3 - Create the API Module

Create:

``` text
src/api/<module>.ts
```

Define backend resource types, request payload types, response types,
and API operations. All HTTP operations should use `apiClient`.

Do not place React state in API modules.

## 5. Phase 4 - Create the Feature

Create:

``` text
src/features/<module>/
```

Recommended initial structure:

``` text
features/<module>/
├── index.ts
├── <Module>Page.tsx
├── use<Module>.ts
└── use<Module>Permissions.ts
```

Additional hooks should only be added when required by actual domain
behaviour.

The feature public API should normally contain only the page:

``` ts
export { ModulePage } from "./ModulePage";
```

## 6. Phase 5 - Create Components

Create:

``` text
src/components/<module>/
```

Possible structure:

``` text
components/<module>/
├── ModuleList.tsx
├── ModuleRow.tsx
├── ModuleForm.tsx
├── ModuleFilters.tsx
└── ModuleSummary.tsx
```

Components should receive data and actions through props or domain
hooks. Components must not directly call API services.

## 7. Phase 6 - Extract Domain Logic When Needed

Do not create a domain abstraction automatically.

Create `src/domain/<module>/` when logic needs to be shared across the
feature and components, or when a component would otherwise depend on
feature internals.

Examples:

``` text
domain/tasks/taskFilters.ts
domain/batteries/batteryFilters.ts
domain/batteries/useBatteryTracking.ts
domain/batteries/useBatteryChargeHistory.ts
```

A domain extraction should solve a real dependency or reuse problem. Do
not create abstractions only to make the directory structure look
symmetrical.

## 8. Phase 7 - Add Permission Handling

First identify the real backend permission used by the legacy module. Do
not invent frontend permission names.

Use the shared permission infrastructure:

``` text
usePermissions
utils/permissions.ts
```

Then create a feature-specific mapping if needed.

Example:

``` ts
const {
    has,
    loadingPermissions,
    permissionError,
} = usePermissions(userId);

return {
    canManageModule: has("REAL_PERMISSION_NAME"),
    loadingPermissions,
    permissionError,
};
```

Permission checks in React improve the UI but do not replace backend
permission enforcement.

## 9. Phase 8 - Add the Entry Point

Create:

``` text
src/entries/<module>-entry.tsx
```

The entry should import the feature through its public API:

``` ts
import { ModulePage } from "../features/module";
```

Do not import `../features/module/ModulePage` directly.

## 10. Phase 9 - Mount into Blade

Add a React mount element to the existing Blade page.

During migration, keep the legacy implementation available until the
React version has been verified. This provides side-by-side comparison,
easier debugging, rollback capability, and reduced migration risk.

Do not remove the legacy implementation immediately after the React page
first renders.

## 11. Phase 10 - Add Styling

Create:

``` text
src/styles/<module>.css
```

Ensure the build configuration produces the expected stable asset names.
The existing Blade page should be able to load the generated module
JavaScript and CSS explicitly.

## 12. Phase 11 - Functional Parity Testing

Compare React behaviour with the legacy implementation.

At minimum consider testing:

``` text
Page load
Loading state
Empty state
Error state
Create
Edit
Delete
Primary domain action
Undo, if applicable
Filters
Search
Permissions
Disabled actions
Backend validation
Refresh after mutation
```

Not every module requires every item. Use legacy behaviour as the
baseline.

## 13. Phase 12 - Architecture Verification

Check that components do not call APIs directly:

``` bash
grep -R 'apiClient' src/components/<module> || true
```

Check that components do not depend on feature internals:

``` bash
grep -R 'features/<module>' src/components/<module> || true
```

Check that the feature does not depend on another feature. Review any
output manually because search patterns may also match legitimate local
paths.

Run:

``` bash
npm run build
npm run lint
```

Both must pass before considering the migration stable.

## 14. Phase 13 - Browser Regression

After build and lint pass, test the real Grocy page in the browser.

Do not treat successful TypeScript compilation as proof of functional
parity.

Verify:

-   page renders;
-   network requests use expected endpoints;
-   mutations persist in the backend;
-   refresh preserves the new state;
-   permissions behave correctly;
-   legacy functionality has not been unintentionally broken.

## 15. Phase 14 - Evidence Collection

For the agentic development report, preserve evidence from each
migration.

Useful evidence includes:

``` text
Prompt / agent instructions
Agent output
Plan
Source diff
Commit
Build output
Lint output
Browser screenshots
Network requests
API responses
Errors encountered
Corrections made
Time taken
Token/cost information, where available
Human review decisions
```

Do not record only successful attempts. Failures and corrections are
useful evidence when explaining agent behaviour and human supervision.

## 16. Recommended Commit Pattern

Use small commits representing meaningful migration steps.

Examples:

``` text
[refactor][stock] add React read-only stock list
[refactor][stock] add filters and summary
[refactor][stock] add stock workflow actions
[refactor][stock] add permission-aware actions
[refactor][stock] complete React migration
```

Avoid one large commit containing the entire module rewrite. Small
commits make review easier, rollback safer, agent output easier to
evaluate, and migration progress easier to measure.

## 17. Definition of Done

A migrated module is not complete only because it renders.

The migration is considered stable when:

-   the React page mounts correctly;
-   required API operations are typed;
-   core legacy workflows have functional parity;
-   permissions are preserved;
-   backend state changes correctly;
-   page refresh preserves persisted changes;
-   components do not perform direct API operations;
-   cross-feature dependencies are absent;
-   build passes;
-   lint passes;
-   browser regression passes;
-   evidence has been recorded;
-   legacy removal has been considered separately.

Legacy code removal should be a deliberate cutover decision, not an
automatic part of initial migration.

## 18. Reference Checklist

### Before implementing

``` text
[ ] Legacy behaviour reviewed
[ ] API endpoints verified
[ ] Permissions verified
[ ] Migration boundary defined
[ ] Baseline evidence captured
```

### During implementation

``` text
[ ] Typed API module created
[ ] Feature page created
[ ] Feature hook created
[ ] Components created
[ ] Permission hook created if required
[ ] Domain logic extracted only where justified
[ ] Entry created
[ ] Blade mount added
[ ] CSS entry added
```

### Verification

``` text
[ ] npm run build passes
[ ] npm run lint passes
[ ] No direct API calls from components
[ ] No cross-feature dependency
[ ] Loading state works
[ ] Error state works
[ ] Empty state works
[ ] CRUD/workflow actions work
[ ] Permission restrictions work
[ ] Backend persistence verified
[ ] Browser regression completed
```

### Evidence

``` text
[ ] Agent prompts saved
[ ] Agent outputs saved
[ ] Build/lint output saved
[ ] Errors/corrections recorded
[ ] Screenshots/network evidence saved
[ ] Commits created
```

------------------------------------------------------------------------

## Reference Module

For a completed example of this migration pattern, use the Batteries
module.

Relevant implementation areas include:

``` text
src/api/batteries.ts

src/domain/batteries/

src/components/batteries/

src/features/batteries/

src/features/batteries-overview/

src/entries/batteries-entry.tsx
src/entries/batteries-overview-entry.tsx

src/styles/batteries.css
src/styles/batteries-overview.css
```

When migrating another module, follow the same sequence:

1.  Verify the existing backend endpoints and business rules.
2.  Establish a read-only React baseline.
3.  Keep the legacy implementation available during migration.
4.  Add mutations only after the read path is verified.
5.  Reuse the existing permission hierarchy.
6.  Move reusable business logic into the domain layer.
7.  Keep HTTP access inside API modules.
8.  Add feature-specific workflows incrementally.
9.  Compare the React implementation against the legacy implementation.
10. Run build, lint, architecture and regression verification before
    cutover.

Do not assume that another Grocy module has the same API shape or
permission rules as Batteries. Existing backend behaviour must be
verified before each module is migrated.
