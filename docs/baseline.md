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