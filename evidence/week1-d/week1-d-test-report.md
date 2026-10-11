# Week 1 D — Baseline, Tests and Evidence Report

Date: 2026-10-03 (Pacific/Auckland)
Repository: https://github.com/conghongbo/grocy
Prepared role: D — Baseline / Tests / Evidence

AI evidence: the English task prompt and response are preserved separately in the local assignment archive and are intentionally not included on this branch. This report is the detailed output of that AI-assisted repository audit.

## 1. Executive status

The repository was cloned and independently inspected. A clean baseline worktree and an isolated Workflow A worktree were created, dependencies were installed from their lockfiles, and the same frontend build/lint/runtime checks were run.

Only one workflow branch is currently available from GitHub:

- `workflow-a-big-prompt` at `a7a269e5ddd773f2d63cf6a6153d63ae22e950e5`

No remote branches for Workflow 2 or Workflow 3 were present after a fresh `git fetch --all --prune` and `git ls-remote --heads`. This does **not** block the Week 1 allocation: the schedule only assigns Workflow 1 during Week 1. Workflow 2 and Workflow 3 are needed later for the assignment-wide comparison.

The common workflow starting point is:

- baseline commit `275b6869acad884384b36511012546393a07766c`

## 2. Test environment

| Item | Value |
| --- | --- |
| Operating system | Windows |
| Node.js | v24.14.0 |
| npm | 11.9.0 |
| Git | 2.53.0.windows.2 |
| PHP | Not installed on host |
| Composer | Not installed on host |
| Docker CLI | 29.6.2 |
| Docker daemon | Not running / unavailable |

Because PHP 8.5, Composer and a running Docker daemon were unavailable, the PHP application could not be independently started. This limits authenticated API, database and full `/react` integration verification. This environment limitation must not be recorded as an Agent failure.

## 3. Repository baseline

Measured at commit `275b6869`:

| Measurement | Count |
| --- | ---: |
| Blade view files | 96 |
| PHP controller files, including API controllers | 30 |
| API controller files | 13 |
| Service files | 19 |

The current rewrite target is a React + TypeScript frontend using the existing PHP/Slim backend and REST API.

Important evidence-quality issue: `docs/baseline.md` still contains `...` placeholders for the date, commit and repository measurements. It also labels six functional areas as `PASS` without linking runtime receipts. Those entries should not be cited as verified baseline results until someone runs the PHP application and attaches dated evidence.

## 4. Reproducible commands

The following frontend commands were executed from each isolated `frontend/` directory:

```powershell
npm ci --cache <workspace-local-cache>
npm run build
npm run lint
npm test
npm run dev -- --host 127.0.0.1 --port <isolated-port>
```

`npm test` was attempted on both worktrees. The baseline does not define a test script; Workflow A adds one.

## 5. Results

| Check | Baseline `275b6869` | Workflow A `a7a269e5` |
| --- | --- | --- |
| Clean dependency install | PASS — 27 packages, 0 vulnerabilities, 2.396 s | PASS — 27 packages, 0 vulnerabilities, 2.174 s |
| Production build | PASS — 20 modules, 222.52 kB JS, 5.258 s total command time | PASS — 21 modules, 229.61 kB JS, 4.293 s total command time |
| Lint | PASS — 1.524 s | PASS — 1.529 s |
| Unit test command | NOT AVAILABLE — no `test` script | PASS — 5/5, 0 failed, 1.452 s total command time |
| Development server | PASS — rendered Vite starter | PASS — rendered Grocy migration preview |
| Domain functionality | Not implemented; starter counter only | Not verifiable without PHP/API backend |
| Dev-server API result | N/A | All five visible modules returned `Request failed (502)` because the configured backend was unavailable |
| PHP syntax | Not independently run | Not independently run |
| Authenticated API/database tests | Not run | Not run |
| Git diff whitespace check | N/A | PASS |
| Worktree cleanliness after tests | Clean | Clean |

### Browser observations for Workflow A

The Vite development server rendered each route without a JavaScript crash:

| Route | Heading rendered | Data result |
| --- | --- | --- |
| `#stock` | Stock overview | HTTP proxy 502 |
| `#inventory` | Inventory | HTTP proxy 502 |
| `#chores` | Chores | HTTP proxy 502 |
| `#tasks` | Tasks | HTTP proxy 502 |
| `#batteries` | Batteries | HTTP proxy 502 |

No browser console warnings or errors were captured during this route pass. The visible 502 messages are expected in this test environment because no PHP backend was listening at the Vite proxy target.

## 6. Workflow A evaluation

### What the workflow produced

Relative to `275b6869`, Workflow A changed 29 files with approximately 678 insertions and 330 deletions, including evidence files. It added:

- a PHP `/react` route, controller and Blade shell;
- a typed fetch wrapper;
- simplified Stock and Inventory pages;
- a shared simplified page for Tasks, Chores and Batteries;
- five mocked API-client tests;
- production output configuration targeting `public/react`.

### What passed

- Dependency installation is reproducible from `package-lock.json`.
- TypeScript compilation and Vite production build pass.
- Oxlint passes.
- Five API-client unit tests pass.
- The development server renders all five navigation routes.
- Network failures are surfaced visibly instead of being mistaken for successful data loading.
- The code preserves same-origin credentials and handles JSON errors, empty 204 responses and cancellation.

### Major limitations

1. **The requested large-scale migration is far from complete.** The implementation is a preview containing five simplified views, not functional parity with the 96-view legacy frontend.
2. **The tests do not validate Grocy integration.** All five tests replace `fetch` with mocks. They do not start Grocy, authenticate, use a database, verify actual response shapes, exercise React components or test browser workflows.
3. **Runtime functionality remains unproven.** Every module returned 502 in the available development environment because the PHP backend was not running.
4. **The UI omits substantial behavior.** Tasks lacks CRUD, categories, completed-item views and custom fields; Chores lacks definitions, scheduling, assignment management and complete undo/stock-side-effect coverage; Batteries lacks definitions, replacement and journal parity; Stock/Inventory omits many transaction and entry-level workflows.
5. **The workflow's own evidence records a production integration failure.** `evidence/workflow-a/transcript.md` reports a blank `/react` page and 404s for `/app.js` and `/app.css`.
6. **The recorded failure and current source need reconciliation.** The current `views/react.blade.php` refers to `/react/app.js` and `/react/app.css`, while the transcript says the browser requested `/app.js` and `/app.css`. The final branch should be rerun under PHP and the exact tested commit/configuration recorded so the report does not mix evidence from different states.
7. **`docs/baseline.md` is not a completed baseline.** Its placeholders and unsupported PASS labels weaken later quantitative comparison.

### Interpretation

Workflow A demonstrates the expected trade-off of a high-autonomy big prompt: it generated a broad-looking frontend shell quickly and produced green local build/lint/unit-test signals, but those signals did not establish end-to-end correctness or migration completeness. Its strongest assignment evidence is the gap between apparent automated success and failed/unfinished integration.

## 7. Evidence inventory reviewed

The available workflow branch contains:

- `evidence/workflow-a/prompt.md`
- `evidence/workflow-a/results.md`
- `evidence/workflow-a/transcript.md`
- six screenshots covering Agent output, build, lint, tests, PHP syntax and the blank browser page

The transcript is not a full Agent session transcript; it is a short independent-browser-verification note. If the coding tool can export the original session, that raw export should also be preserved.

## 8. Required next actions

### Week 1 actions

1. Complete and preserve the baseline measurements and receipts.
2. Preserve Workflow A's prompt, transcript, results, screenshots and tested commit.
3. Record the difference between green automated checks and incomplete/failed integration.
4. Prepare the reusable test matrix for later workflows.

### Later inputs for the full assignment comparison

1. Push Workflow 2 and Workflow 3 branches to GitHub.
2. Provide their exact branch names, starting commit hashes and final commit hashes.
3. Confirm that both started from `275b6869` and used the same rewrite target.
4. Preserve each workflow's prompt, complete transcript, results, time and token/cost information.

### Baseline completion

1. Run Grocy under its required PHP 8.5 environment.
2. Record the exact environment, auth mode, database fixture and deployment base path.
3. Replace baseline placeholders with measured values.
4. Execute and capture the original PHP functional checks for Stock, Inventory, Chores, Tasks and Batteries.
5. Record pre-existing warnings and failures rather than silently correcting them.

### Consistent checks for Workflow 2 and 3

Run the same locked commands and record:

- install/build/lint/test exit codes and durations;
- changed files and diff size;
- frontend route rendering;
- actual PHP `/react` integration;
- authenticated API requests;
- Tasks/Chores/Batteries reads and mutations;
- regressions in the legacy PHP interface;
- human intervention count and review time;
- token usage/cost.

## 9. Current conclusion

The Week 1 D work can proceed with the baseline and Workflow A alone. The baseline frontend toolchain and Workflow A's local automated checks are reproducible. Workflow A cannot yet be rated as functionally successful: it is incomplete, its tests are mock-only, full PHP integration was not independently available, and its own evidence reports a blank production page. A fair winner among three workflows will only be selected later, after Workflow 2 and Workflow 3 are available and tested from the same baseline.
