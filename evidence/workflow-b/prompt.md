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

To be completed after the agent returns its migration plan.

---

## Phase 2 — Execution Prompt

To be completed after the Phase 1 plan has been reviewed.