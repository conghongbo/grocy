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