import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { DEFAULT_CHORE_FILTERS, filterChores, getChoreStatus } from '../src/features/chores/choreFilters.ts';
const chore = (id, due, user = null) => ({ chore_id: id, chore_name: `Chore ${id}`, last_tracked_time: null, next_estimated_execution_time: due, next_execution_assigned_to_user_id: user, next_execution_assigned_user: null });
const now = '2026-10-10 12:00:00';
test('due boundaries match server-local overview classification', () => {
    assert.equal(getChoreStatus(chore(1, null), now, 3), 'unscheduled');
    assert.equal(getChoreStatus(chore(1, '2026-10-10 11:59:59'), now, 3), 'overdue');
    assert.equal(getChoreStatus(chore(1, now), now, 3), 'duetoday');
    assert.equal(getChoreStatus(chore(1, '2026-10-10 23:59:59'), now, 3), 'duetoday');
    assert.equal(getChoreStatus(chore(1, '2026-10-13 12:00:00'), now, 3), 'duesoon');
    assert.equal(getChoreStatus(chore(1, '2026-10-13 12:00:01'), now, 3), 'scheduled');
    assert.equal(getChoreStatus(chore(1, '2026-10-11 12:00:00'), now, 0), 'scheduled');
});
test('due-soon window handles year rollover', () => {
    assert.equal(getChoreStatus(chore(1, '2027-01-02 12:00:00'), '2026-12-31 12:00:00', 2), 'duesoon');
});
test('assignment filter compares IDs exactly, including string IDs', () => {
    const rows = [chore(1, null, '1'), chore(2, null, 11), chore(3, null)];
    assert.deepEqual(filterChores(rows, { ...DEFAULT_CHORE_FILTERS, user: '1' }, now, 3).map(row => row.chore_id), [1]);
    assert.deepEqual(filterChores(rows, { ...DEFAULT_CHORE_FILTERS, user: 'unassigned' }, now, 3).map(row => row.chore_id), [3]);
});
test('search and status combine; filtering preserves source array', () => {
    const rows = [chore(1, null), chore(2, '2026-10-09 12:00:00'), chore(3, '2026-10-10 14:00:00')];
    const snapshot = JSON.stringify(rows);
    assert.deepEqual(filterChores(rows, { search: ' CHORE 2 ', status: 'overdue', user: 'all' }, now, 3).map(row => row.chore_id), [2]);
    assert.deepEqual(filterChores(rows, DEFAULT_CHORE_FILTERS, now, 3).map(row => row.chore_id), [2, 3, 1]);
    assert.equal(JSON.stringify(rows), snapshot);
});
test('API execution and undo use backend IDs and verified endpoints', async () => {
    const calls = [];
    globalThis.__choresTestClient = { get: async path => { calls.push(['GET', path]); return []; }, post: async (path, body) => { calls.push(['POST', path, body]); return { id: 987, chore_id: 12 }; } };
    const source = readFileSync(new URL('../src/api/chores.ts', import.meta.url), 'utf8').replace("import { apiClient } from './client';", 'const apiClient = globalThis.__choresTestClient;');
    const { choresApi } = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
    await choresApi.current();
    const result = await choresApi.execute(12);
    await choresApi.undo(result.id);
    assert.deepEqual(calls, [['GET', '/api/chores'], ['POST', '/api/chores/12/execute', {}], ['POST', '/api/chores/executions/987/undo', {}]]);
    delete globalThis.__choresTestClient;
});
