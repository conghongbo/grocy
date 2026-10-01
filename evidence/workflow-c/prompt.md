# Workflow C – Iterative Human-in-the-Loop Experiment

## Experiment Design

Workflow C evaluates an iterative human-in-the-loop approach to the Grocy frontend migration.

Unlike Workflow A, the agent will not receive one large autonomous migration prompt.

Unlike Workflow B, the agent will not first produce a complete migration plan for the full frontend migration.

Instead, the migration will be divided into small implementation iterations.

Each iteration follows this process:

1. A narrowly scoped task is given to the agent.
2. The agent implements only that task.
3. The implementation is validated.
4. The result is reviewed by the human developer.
5. The next task is defined based on the previous result.

The agent must not continue into later iterations unless explicitly instructed.

---

## Iteration 1 – React Integration Foundation

Analyse the existing Grocy project and implement only the minimum integration foundation required to mount a React and TypeScript page inside the existing Grocy application.

Preserve:

- the existing PHP backend;
- the existing database;
- existing authentication and permission handling;
- existing REST APIs;
- the existing Blade application shell;
- existing legacy pages.

The React application should coexist with the legacy frontend rather than replacing it.

Use the existing `frontend/` React and TypeScript project where appropriate.

Review `docs/architecture.md` and `docs/baseline.md` before making implementation decisions.

For this iteration, focus only on the integration foundation required for React to run inside Grocy.

Do not migrate Tasks, Chores, Batteries, Stock, or any other functional domain yet.

Validate the implementation using appropriate build, lint, syntax, or focused integration checks where possible.

When this iteration is complete, stop and report:

- what you changed;
- architectural decisions made;
- files changed;
- validation performed;
- problems encountered;
- remaining limitations.

Do not continue to another migration stage without further instruction.