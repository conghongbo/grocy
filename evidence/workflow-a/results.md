# Workflow A — Results

## Workflow

**Workflow A — High-Level Instruction / Big Prompt**

The coding agent was given a high-level migration task and was allowed to
work relatively autonomously with minimal human intervention.

The purpose of this workflow was to evaluate how effectively an agent could
analyse the existing Grocy codebase, make architectural decisions, implement
a frontend migration, and validate its own work without detailed step-by-step
instructions.

---

## Agent Execution

The agent worked autonomously for approximately **8 minutes 27 seconds**.

During this execution, the agent analysed the existing Grocy project and
implemented an incremental React and TypeScript frontend while retaining the
existing PHP backend, database, REST API, and legacy pages.

The agent chose to expose the new frontend through the `/react` route rather
than replacing the existing Grocy frontend immediately.

---

## Changes Produced

The agent produced changes across **20 files**.

Git reported:

- **339 insertions**
- **278 deletions**

Major additions included:

- `controllers/ReactController.php`
- `views/react.blade.php`
- `docs/migration.md`
- `frontend/src/api/grocy.ts`
- `frontend/src/components/Resource.tsx`
- `frontend/src/pages/StockPage.tsx`
- `frontend/src/pages/ActivityPage.tsx`
- `frontend/tests/client.test.ts`

The agent also modified existing frontend configuration, API client,
application, styling, routing, architecture documentation, and baseline
documentation.

---

## Functionality Attempted

According to the agent's implementation and final report, the React frontend
included support for:

- Stock updates
- Inventory counts
- Task completion
- Chore tracking
- Battery charging
- Activity undo

The migration was incremental and continued to use the existing Grocy REST
API and PHP services.

Full frontend parity with the existing Grocy interface was not completed.

The agent explicitly identified the following areas as still incomplete:

- Advanced forms
- Scanning
- Reports
- Localisation
- Browser testing

---

## Agent Self-Validation

The agent reported that it performed the following validation:

- Production build
- Lint
- Five API-client tests
- PHP syntax checks
- Git diff/whitespace validation
- Isolated PHP/API runtime and integration checks

The agent initially summarised these validation activities as successful.

Further inspection of the validation history showed that some runtime checks
required environment setup and retries before succeeding.

---

## Independent Verification

The generated implementation was independently checked after the autonomous
agent run.

### Production Build

**PASS**

Command:

`npm run build`

TypeScript compilation and the Vite production build completed successfully.

The build generated:

- `public/react/index.html`
- `public/react/app.css`
- `public/react/app.js`

---

### Lint

**PASS**

Command:

`npm run lint`

Result:

- 0 warnings
- 0 errors

The agent later reported that an earlier lint run had produced one
`react/set-state-in-effect` warning, which was resolved during its autonomous
work.

---

### API Client Tests

**PASS**

Command:

`npm test`

Result:

- Tests: 5
- Passed: 5
- Failed: 0
- Skipped: 0
- Cancelled: 0

The tests covered API/session handling, empty successful responses, backend
validation errors, expired sessions or unexpected HTML responses, and request
cancellation.

---

### PHP Syntax

**PASS**

Commands:

`php -l controllers/ReactController.php`

`php -l routes.php`

Both files returned no PHP syntax errors.

---

### Git Diff Check

**PASS**

Command:

`git diff --cached --check`

No whitespace errors were reported.

---

## Runtime and Integration Validation

The agent reported that its isolated PHP/API integration checks eventually
completed successfully.

However, the detailed execution history showed that the runtime validation
was not immediately successful.

During testing:

- An initial sandbox server attempt was prevented from listening.
- An early `/react` request returned HTTP 200 but contained a PHP fatal error
  because the `migrations` table was missing.
- After database initialisation, `/react` returned the expected React HTML
  shell and bootstrap configuration.
- A request to `/` returned HTTP 200 while containing a PHP fatal error when
  demo-data generation exceeded 30 seconds.
- REST API checks subsequently returned expected data after sufficient test
  environment initialisation.
- Seven API endpoints were exercised by the agent's temporary integration
  script.

This demonstrates that HTTP status alone was not sufficient to determine
whether the application was functioning correctly.

---

## Browser / Visual Verification

**FAIL**

The migrated frontend was manually tested using the local Grocy development
server:

`php -S localhost:8000 -t public`

The following route was opened in Chrome:

`http://localhost:8000/react`

The page displayed a blank screen.

Chrome DevTools reported:

- `GET http://localhost:8000/app.js` → 404
- `GET http://localhost:8000/app.css` → 404

However, the production build had generated the assets at:

- `public/react/app.js`
- `public/react/app.css`

This indicates a runtime asset-path integration problem.

The automated build, lint, unit tests, PHP syntax checks, and isolated API
checks did not detect this problem.

No corrective changes were made during this verification stage.

---

## Testing Limitations

The agent explicitly reported that it did not perform:

- Browser/visual testing
- Stock mutation integration testing

Therefore, passing automated validation did not demonstrate complete
end-to-end frontend functionality.

Manual browser verification subsequently identified a runtime failure that
prevented the React interface from rendering.

---

## Human Intervention

The implementation phase used minimal human intervention.

The agent was given the original high-level prompt and allowed to analyse,
plan, implement, and validate the migration autonomously.

After the implementation was completed, human involvement was limited to:

- Requesting the exact validation commands used by the agent
- Independently rerunning build, lint, tests, PHP syntax checks, and Git diff
  checks
- Starting the local Grocy development server
- Performing manual browser verification

No implementation guidance or corrective coding instruction was provided
during the autonomous migration run.

---

## Outcome

Workflow A demonstrated that a high-level prompt enabled the coding agent to
make substantial architectural and implementation changes with little human
guidance.

The agent successfully created an incremental React/TypeScript architecture,
integrated it with the existing Grocy backend, produced automated tests, and
passed build, lint, API-client, PHP syntax, and Git diff checks.

However, independent browser verification identified a runtime asset-path
problem that prevented the React frontend from rendering.

Therefore, Workflow A produced a substantial but incomplete migration. Its
automated validation was useful for detecting compile-time, lint, API-client,
and syntax problems, but it was insufficient to establish that the migrated
frontend worked correctly in a real browser environment.

---

## Initial Reflection

The main strength of the high-level workflow was autonomy. The agent was able
to inspect the existing project, select an incremental migration strategy,
implement multiple frontend and backend integration changes, and construct
its own validation approach without detailed human instructions.

The main weakness was validation completeness. The agent's initial summary
gave a stronger impression of implementation success than the subsequent
browser test supported. Although several automated checks passed, the lack of
browser-level validation allowed a relatively simple asset-path problem to
remain undetected.

This result suggests that high agent autonomy can generate substantial
development progress quickly, but successful automated checks should not be
treated as equivalent to end-to-end functional correctness.