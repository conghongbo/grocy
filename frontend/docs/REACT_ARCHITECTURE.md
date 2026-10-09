# Grocy React Frontend Architecture

## 1. Purpose

This document defines the architecture used for the incremental React
and TypeScript frontend refactoring of Grocy.

The refactoring does not replace the existing PHP backend, database,
authentication, permissions, routing, or REST API. Instead, React is
introduced incrementally at page level while the existing Grocy
application remains operational.

The main goals are:

-   preserve existing backend behaviour;
-   reduce migration risk;
-   allow legacy and React pages to coexist;
-   create clear frontend module boundaries;
-   centralise shared infrastructure;
-   keep domain-specific behaviour inside domain modules;
-   provide a repeatable migration pattern for other Grocy modules.

## 2. Migration Strategy

The frontend refactoring uses an incremental strangler-style migration.

The existing Grocy application continues to provide:

-   PHP/Slim backend;
-   database and services;
-   authentication and session handling;
-   permission enforcement;
-   server-side routing;
-   Blade application shell;
-   navigation;
-   localisation;
-   existing REST APIs.

React replaces selected page-level frontend functionality.

During migration, the legacy implementation may remain available
alongside the React implementation until functional parity has been
verified. This allows each module to be migrated and tested
independently without requiring a full frontend rewrite in a single
step.

## 3. High-Level Architecture

``` text
Browser
   |
   v
Existing Grocy Blade Shell
   |
   +-----------------------------+
   |                             |
   v                             v
Legacy Blade UI             React Mount
                                 |
                                 v
                           Feature Entry
                                 |
                                 v
                           Feature Page
                          /      |      \
                         /       |       \
                        v        v        v
                 Feature Hook  Domain   Components
                        |        |          |
                        |        |          v
                        |        |     Common Components
                        |        |
                        +----+---+
                             |
                             v
                         API Layer
                             |
                             v
                      Shared API Client
                             |
                             v
                    Existing Grocy REST API
                             |
                             v
                    PHP Services / Database
```

React does not own application-level routing. Grocy's existing PHP/Slim
routing remains responsible for selecting pages. React is mounted into
individual existing pages.

## 4. Source Structure

``` text
src/
├── api/
│   ├── client.ts
│   ├── permissions.ts
│   ├── user.ts
│   ├── tasks.ts
│   └── batteries.ts
├── app/
│   ├── bootstrap.ts
│   └── mount.tsx
├── components/
│   ├── common/
│   ├── tasks/
│   └── batteries/
├── domain/
│   ├── tasks/
│   └── batteries/
├── entries/
│   ├── tasks-entry.tsx
│   └── batteries-entry.tsx
├── features/
│   ├── tasks/
│   └── batteries/
├── hooks/
│   ├── useCurrentUser.ts
│   └── usePermissions.ts
├── styles/
│   ├── tasks.css
│   └── batteries.css
└── utils/
    ├── errors.ts
    └── permissions.ts
```

## 5. Layer Responsibilities

### 5.1 Entries

`src/entries/` contains the external entry points for individual React
modules.

Responsibilities:

-   import the feature through its public API;
-   import feature-specific CSS;
-   mount the React page into the Blade-provided DOM element.

Entries must not contain business logic or import internal feature hooks
directly.

Correct:

``` ts
import { TasksPage } from "../features/tasks";
```

Avoid:

``` ts
import { TasksPage } from "../features/tasks/TasksPage";
import { useTasks } from "../features/tasks/useTasks";
```

### 5.2 Features

`src/features/<feature>/` coordinates one migrated Grocy module.

Typical structure:

``` text
features/tasks/
├── index.ts
├── TasksPage.tsx
├── useTasks.ts
├── useTaskFormOptions.ts
└── useTaskPermissions.ts
```

The feature page coordinates data hooks, permission hooks, domain logic,
UI components, and page-level state.

Feature hooks may use API modules, shared hooks, shared utilities, and
domain logic. Features must not depend on another feature.

### 5.3 Feature Public API

Every feature exposes a small public API through
`features/<feature>/index.ts`.

For page-level modules, the default public API should normally only
expose the page component:

``` ts
export { TasksPage } from "./TasksPage";
```

Internal hooks such as `useTasks`, `useTaskPermissions`, and
`useTaskFormOptions` should not be exported unless another architectural
layer has a valid reason to use them.

### 5.4 Components

`src/components/` contains presentation and user-interaction components.

Domain-specific components belong under `components/tasks/`,
`components/batteries/`, etc. Reusable states such as `LoadingState`,
`ErrorState`, and `EmptyState` belong under `components/common/`.

Components must not call API services directly. The preferred direction
is:

``` text
Component
   |
   v
Domain / Feature Hook
   |
   v
API
```

Type-only imports from API modules are acceptable when the API type
represents the same backend resource used by the component.

### 5.5 Domain Layer

`src/domain/` contains reusable behaviour belonging to a specific Grocy
domain but not to a particular page implementation.

Examples:

``` text
domain/tasks/taskFilters.ts
domain/batteries/batteryFilters.ts
domain/batteries/useBatteryTracking.ts
domain/batteries/useBatteryChargeHistory.ts
```

The domain layer is useful when logic is required by both feature
coordination code and presentation components. This avoids reverse
dependencies such as `Component -> Feature`.

Domain code may call the appropriate API module when implementing domain
behaviour through hooks. Domain code must not depend on feature pages.

### 5.6 API Layer

`src/api/` defines typed access to existing Grocy endpoints.

The API layer should:

-   define request and response types;
-   define endpoint-specific operations;
-   use the shared API client;
-   avoid UI state;
-   avoid React-specific behaviour.

Components should not call API modules directly.

## 6. Shared Infrastructure

### 6.1 API Client

All frontend HTTP requests should use `src/api/client.ts`. Feature
modules should not create independent fetch wrappers. Direct `fetch()`
calls should be avoided when the shared client can perform the request.

### 6.2 Shared Hooks

Cross-feature React behaviour belongs under `src/hooks/`.

Current examples:

-   `useCurrentUser`
-   `usePermissions`

Shared hooks must not depend on a specific feature. They may depend on
`api/` and `utils/`.

### 6.3 Permission Architecture

Permission loading is centralised through `usePermissions`. Permission
hierarchy resolution is centralised through `utils/permissions.ts`.

Feature-specific permission hooks map generic permission checks to
domain capabilities. Permission checks must preserve Grocy's
hierarchical permission model. A parent permission may satisfy a child
permission, and feature-specific permission hooks should fail closed
when permission information cannot be loaded.

Frontend permission checks improve the UI but do not replace backend
permission enforcement.

### 6.4 Error Handling

Unknown errors are converted into user-facing messages through
`src/utils/errors.ts`:

``` ts
getErrorMessage(caughtError, "Fallback message");
```

Do not duplicate local
`error instanceof Error ? error.message : fallback` implementations
unless a module genuinely requires different behaviour.

### 6.5 Async State

Not all asynchronous behaviour should be forced into one generic hook.
Hooks such as `useTasks`, `useBatteries`, `useBatteryTracking`, and
`useBatteryChargeHistory` have different domain semantics.

The architecture centralises stable shared behaviour, such as error
conversion and permission loading, while preserving domain-specific
asynchronous workflows. This avoids excessive abstraction.

## 7. Styling and Build Integration

Each migrated page has its own CSS entry, for example:

``` text
styles/tasks.css
styles/batteries.css
```

The build configuration produces stable page-specific assets for
existing Blade templates. Blade loads the generated React JavaScript and
CSS explicitly, so predictable output file names must be preserved.

## 8. Dependency Rules

Allowed dependencies:

``` text
Entry
  -> Feature Public API

Feature Page
  -> Feature Hooks
  -> Domain
  -> Components

Feature Hook
  -> API
  -> Shared Hooks
  -> Shared Utilities
  -> Domain

Component
  -> Domain
  -> Common Components

Domain
  -> API
  -> Shared Utilities

API Module
  -> Shared API Client
```

Forbidden dependencies:

``` text
Feature A -> Feature B
Component -> Feature
Component -> apiClient
Component -> runtime API service calls
API -> Feature
API -> Component
Shared Hook -> Feature
Domain -> Feature
Entry -> internal Feature Hook
```

## 9. Architecture Verification

Useful checks include:

``` bash
grep -R 'features/tasks' src/components src/domain || true
grep -R 'features/batteries' src/components src/domain || true
grep -R 'apiClient' src/components || true
grep -R 'tasksApi' src/components || true
grep -R 'batteriesApi' src/components || true
```

Cross-feature dependencies can be checked with:

``` bash
grep -R 'features/tasks' src/features/batteries || true
grep -R 'features/batteries' src/features/tasks || true
```

The application must also pass:

``` bash
npm run build
npm run lint
```

## 10. Reference Implementations

### Tasks

Tasks is the primary reference implementation for a conventional CRUD
and workflow-oriented module. It demonstrates React page mounting, typed
API access, CRUD, completion and undo, filtering, summary information,
form options, current-user integration, and permission-aware actions.

### Batteries

Batteries is the reference implementation for a more complex domain
workflow. It demonstrates CRUD, summary and filtering, domain state,
charge tracking, replacement workflow, charge history, undo,
hierarchical permissions, domain hooks, and separation between UI and
API behaviour.

Together, Tasks and Batteries provide the reference architecture for
subsequent Grocy module migrations.

## 11. Migration Principle

The purpose of the architecture is not to maximise abstraction.

> Extract stable repetition while preserving domain-specific behaviour.

A new abstraction should only be introduced when it improves multiple
modules without hiding important Grocy domain behaviour.

The migration should favour small incremental changes, explicit
dependencies, typed API boundaries, preserved backend behaviour,
measurable functional parity, easy rollback, and coexistence with legacy
UI.

------------------------------------------------------------------------

## Batteries Reference Implementation

The Batteries module is the first larger Grocy module migrated through
the incremental React architecture and is used as a reference
implementation for future module migrations.

### Migration scope

The Batteries migration includes:

-   Battery list and management
-   Battery creation, editing and deletion
-   Search and filtering
-   Rechargeable and single-use battery handling
-   Battery state presentation
-   Charge-cycle tracking
-   Charge history
-   Charge-cycle undo
-   Battery replacement workflow
-   Permission-aware actions
-   Battery overview
-   Summary and due-status filtering
-   Battery details
-   Battery journal integration
-   Grocycode integration
-   Label-printer integration
-   Dynamic battery userfields

### Architecture

The migrated module follows the standard dependency direction:

``` text
Entry
  ↓
Feature / Page
  ↓
Domain hooks and models
  ↓
API module
  ↓
Shared apiClient
  ↓
Existing Grocy REST API
```

Reusable presentation components depend on domain models or hooks rather
than feature implementations.

The following dependency rules were verified:

-   Components do not call `fetch()` directly.
-   Components do not call `batteriesApi` directly.
-   Features and components do not call `apiClient` directly.
-   Components do not depend on Batteries feature implementations.
-   Domain code does not depend on Batteries feature implementations.
-   Network access remains isolated behind the API layer.

### Backend reuse

The migration does not replace the existing Grocy backend.

The React implementation continues to use the existing:

-   PHP/Slim routes
-   REST API
-   database
-   session and authentication system
-   permission hierarchy
-   battery business rules
-   Blade application shell

This limits the rewrite boundary to the frontend while preserving
existing backend behaviour.

### Permission model

The React implementation uses the existing Grocy hierarchical permission
model.

Battery master-data operations use:

-   `MASTER_DATA_EDIT`

Battery tracking and replacement operations use:

-   `BATTERIES_TRACK_CHARGE_CYCLE`

Charge-cycle undo uses:

-   `BATTERIES_UNDO_CHARGE_CYCLE`

Frontend permission gating supplements rather than replaces backend
authorization.

### Userfields

Battery userfields are loaded and saved through the existing Grocy
Userfields API.

The battery form loads existing values before mounting the editable form
so that asynchronous userfield data becomes the initial form state.

The overview dynamically renders userfields configured to be shown as
table columns.

### Legacy coexistence

The React implementation and legacy implementation intentionally coexist
during the migration stage.

The legacy implementation is retained to:

-   compare behaviour and data during development
-   verify functional parity
-   reduce migration risk
-   provide a fallback during incremental rollout

Removing the legacy implementation is therefore treated as a separate
cutover decision rather than a requirement for completing the React
migration.

### Verification

The Batteries migration passed:

-   TypeScript production build
-   lint with zero warnings and zero errors
-   architecture dependency checks
-   battery CRUD regression tests
-   userfield persistence tests
-   charge tracking tests
-   charge history tests
-   undo tests
-   replacement workflow tests
-   overview summary parity tests
-   due-status parity tests
-   search and filtering tests
-   details and journal tests
-   Grocycode tests
-   label-printer feature-gating tests
-   runtime console checks

The completed Batteries module can therefore be used as a reference for
migrating additional Grocy modules.
