# Grocy React Migration Architecture

## Migration strategy

Grocy is migrated incrementally.

The existing PHP/Slim backend, Blade application shell,
authentication, permissions and REST API remain authoritative.

React replaces page-level frontend functionality gradually.

## Dependency direction

React Page
    ↓
Feature Hook
    ↓
Domain API
    ↓
Shared API Client
    ↓
Existing Grocy REST API

Dependencies must not point upward.

## Rules

1. React pages must not access the database.
2. React pages must not call fetch directly.
3. Existing REST APIs are the compatibility boundary.
4. API endpoints must be verified against Grocy source/OpenAPI.
5. Avoid `any`.
6. Existing backend permission checks remain authoritative.
7. Blade remains responsible for the application shell.
8. Legacy implementations remain available during migration.
9. Every migrated module must have verification coverage.
10. Tasks is the reference implementation.

## Reference module

Tasks

## Planned modules

Tasks       → Reference / migrated
Stock       → Pending
Chores      → Pending
Batteries   → Pending