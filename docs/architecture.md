# Grocy Frontend Refactoring Architecture

## Current Grocy Architecture

Browser
   │
   ▼
Server-rendered UI
(Blade Templates + jQuery + Bootstrap)
   │
   ▼
Grocy PHP Backend
   │
   ├── Controllers
   ├── API Controllers
   └── Services
   │
   ▼
Database


## Proposed Agentic Rewrite Architecture

Browser
   │
   ▼
React + TypeScript
   │
   ▼
Typed API Client
   │
   ▼
Existing Grocy REST API
   │
   ▼
Existing PHP Services
   │
   ▼
Database

## Architecture Goals

- Replace legacy frontend code incrementally rather than rewriting the entire application.
- Preserve the existing Grocy REST API and PHP backend.
- Introduce React and TypeScript for a more maintainable frontend architecture.
- Introduce a typed API client to separate frontend components from backend communication.
- Enable incremental migration of individual Grocy pages.
- Reduce coupling between UI logic and backend implementation.
- Improve testability and maintainability.
- Use AI-assisted development to support analysis, migration, testing, and documentation.

## Implemented incremental architecture

`/react` now hosts the opt-in application. A minimal PHP-rendered host supplies URLs and feature flags; React owns navigation and UI. `frontend/src/api/client.ts` handles transport, `api/grocy.ts` defines endpoint contracts, and reusable hooks handle asynchronous reads and mutations. Stock/inventory and task/chore/battery pages use existing REST service endpoints. Existing Blade pages continue to serve advanced workflows. See [migration.md](migration.md) for supported functionality, deployment, validation and parity gaps.
