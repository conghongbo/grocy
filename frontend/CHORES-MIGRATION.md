# Chores React preview

Open the existing Chores overview URL with `?react` to opt into React. The
default overview remains available. This reuses the Blade shell, shared API
client and existing GET `/api/chores`, POST `/api/chores/{choreId}/execute`,
POST `/api/chores/executions/{executionId}/undo` endpoints.

Includes list, due information, summary counts, search, exact assignment ID
and status filters, execution using server time/current user, and undo of
execution records created in this page session. Backend-rendered permissions
control buttons; API authorization remains authoritative.

In frontend: `npm ci`, `npm run build`, `npm run lint`.
Run `node --test tests/chores.test.mjs` with Node 24 or later.
The shared CSS retains the existing tasks.css filename for compatibility.

Manual verification before merging:

1. Compare `/choresoverview` and `/choresoverview?react` with the same database.
2. Check overdue, today, due soon (including zero-day setting), no schedule,
   date-only chores, disabled chores, assignment flag and restricted users.
3. Execute a test chore once; check journal, updated schedule and assignment.
4. Undo its execution; check journal undo and restored schedule. Refresh to
   confirm persistence. Undo links are intentionally session scoped.
5. Verify failed read/mutation handling, then retry with Refresh. A successful
   execution retains its undo record if the following list refresh fails.
6. Verify Tasks still loads after the multi-entry build and legacy Chores actions
   work. Check narrow-screen layout and keyboard access.

Custom-time tracking, another execution user, skipping, rescheduling, custom
fields, table column configuration and journal management remain in legacy
views. This is the initial core migration, not complete legacy feature parity.
