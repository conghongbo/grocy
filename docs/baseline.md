# Grocy Agentic Rewrite Baseline

## Date
...

## Commit
...

## Original Architecture

Frontend:
- Blade templates
- jQuery
- Bootstrap
- DataTables
- Moment.js
- FullCalendar
- Other existing JS plugins

Backend:
- PHP
- Slim
- Grocy services/controllers

API:
- Existing REST API
- OpenAPI definition: grocy.openapi.json

## Repository Measurements

Blade views:
Controllers:
API controllers:
Services:

## Build State

Application startup:
Build:
Tests:

## Functional Baseline

- Stock Overview: PASS
- Inventory: PASS
- Chores Overview: PASS
- Chore Tracking: PASS
- Tasks: PASS
- Batteries: PASS

## Rewrite Target

Current:

Blade + jQuery
      ↓
PHP/Slim
      ↓
Database

Target:

React + TypeScript
      ↓
Grocy REST API
      ↓
Existing PHP/Slim backend
      ↓
Database
## Migration checkpoint (2026-10-01)

Starting commit: `c2b05eae`. The original PASS labels above are historical assertions, not checks reproduced by this migration. Measured source counts and actual validation results are recorded in [migration.md](migration.md). The opt-in React implementation builds, lints and passes five API client tests, with PHP shell and activity integration checks against a temporary database. It does not yet establish full frontend functional parity.
