# Workflow B — Plan → Review → Execute

## Experiment Type

Explicit planning phase followed by a human review checkpoint and a separate execution phase.

The purpose of this workflow is to evaluate whether requiring the coding agent
to analyse and plan the migration before implementation produces a more
reliable result than the high-autonomy Big Prompt used in Workflow A.

---

## Phase 1 — Planning Prompt

Analyse the existing Grocy project and develop a detailed migration plan for
moving its Blade/jQuery frontend toward React and TypeScript.

Preserve the existing Grocy functionality and use the existing REST API where
possible. Do not replace the existing PHP backend or database.

Review `docs/architecture.md` and `docs/baseline.md` to understand the current
architecture and intended migration direction.

During this phase:

- Analyse the relevant existing project structure and frontend architecture.
- Identify the major technical risks and compatibility constraints.
- Identify how React should integrate with the existing Grocy application.
- Determine an incremental migration strategy.
- Identify which existing REST APIs can be reused.
- Identify appropriate validation and testing steps.
- Propose the files and components that would need to be created or modified.
- Define clear implementation stages and completion criteria.

Do not modify any project files.

Do not implement the migration yet.

Return only your analysis and proposed migration plan so that it can be
reviewed before implementation.

---

## Phase 1 Review

The proposed migration plan was reviewed before implementation.

The overall architecture was accepted because it preserves the existing PHP
backend, authentication, Blade application shell, REST APIs, and legacy pages
while introducing React incrementally.

The following aspects of the plan were specifically accepted:

- Retain the existing Grocy URLs and server-side routing.
- Mount React inside the existing Blade application rather than replacing the
  backend or application shell.
- Preserve existing browser authentication and backend permission checks.
- Use a typed API layer rather than placing raw API calls directly in React
  components.
- Load production assets through Grocy/PHP-aware URL handling instead of
  assuming root-relative asset paths.
- Keep legacy and React implementations independently selectable during the
  migration.
- Validate browser behavior in addition to build, lint, and unit tests.

The full Stage 0–6 migration plan was considered too large for a single
experimental implementation run.

For the execution phase, the scope was therefore limited to:

1. Stage 1 — Integration foundation.
2. Stage 2 — Tasks pilot.

Later stages covering chores, batteries, stock, remaining domains, and final
consolidation were intentionally excluded from this run.

No implementation changes were requested during the planning review.

---

## Phase 2 — Execution Prompt

Proceed with the approved migration plan, but implement only the agreed
experimental scope:

- Stage 1 — Integration foundation
- Stage 2 — Tasks pilot

Do not continue into chores, batteries, stock, remaining domains, or final
consolidation.

Implement the integration foundation described in your plan, including the
React mounting strategy, bootstrap context, production asset loading,
API/client boundary, and compatibility measures required for the Tasks pilot.

Then migrate the Tasks area as the first React pilot while preserving the
existing PHP backend, authentication, REST APIs, Blade application shell, and
legacy functionality.

Follow the risks, compatibility constraints, and completion criteria identified
in your planning phase.

In particular:

- Preserve existing Grocy URLs and server-side routing.
- Do not replace the PHP backend or database.
- Reuse existing domain REST endpoints where appropriate.
- Preserve existing browser authentication and backend permission checks.
- Avoid root-relative assumptions for production assets.
- Prevent legacy JavaScript and React from competing for ownership of the same
  migrated DOM subtree.
- Keep the migration incremental and rollback-compatible.
- Do not implement later migration stages outside the approved scope.

Validate the implementation using the validation strategy proposed in your
plan.

Run appropriate TypeScript, lint, test, production-build, PHP, and integration
checks where possible.

Also perform browser-level verification of the migrated Tasks page and verify
that the production JavaScript and CSS assets load successfully.

When finished, report:

1. What was implemented.
2. Which files were changed.
3. Which validation commands were run.
4. The result of each validation.
5. Any incomplete functionality or known limitations.
6. Any deviations from the approved plan.