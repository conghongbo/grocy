import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createClient, ApiError } from '../src/api/client.ts'
import { dueStatus, matchesStatus, localDate, localTimestamp } from '../src/features/tasks/status.ts'
test('transport preserves installation prefix, session auth, JSON headers and 204', async () => {
  const transport = async (url: string | URL | Request, options?: RequestInit) => {
    assert.equal(url, 'https://example.test/grocy/index.php/api/tasks/1/complete')
    assert.equal(options?.credentials, 'same-origin')
    assert.equal((options?.headers as Record<string, string>)?.['Content-Type'], 'application/json')
    return new Response(null, { status: 204 })
  }
  assert.equal(await createClient('https://example.test/grocy/index.php/api/', transport)('tasks/1/complete', { method: 'POST', body: '{}' }), undefined)
})
test('JSON results and structured/non-JSON failures', async () => {
  assert.deepEqual(await createClient('/grocy/api', async () => new Response('{"id":1}'))('/tasks'), { id: 1 })
  for (const [status, body, message] of [[400, '{"error_message":"Rejected"}', 'Rejected'], [401, '', 'Grocy API request failed: 401'], [403, '<html>Forbidden</html>', 'Grocy API request failed: 403']] as const) {
    await assert.rejects(createClient('/api', async () => new Response(body, { status }))('tasks'), (error: unknown) => error instanceof ApiError && error.status === status && error.message === message)
  }
  await assert.rejects(createClient('/api', async () => new Response('<html>login</html>'))('tasks'), /Invalid JSON/)
})
test('due boundaries, calendar days, invalid dates, and today in due-soon', () => {
  const now = new Date(2026, 9, 1, 23, 59)
  assert.equal(localDate(now), '2026-10-01')
  assert.equal(localTimestamp(now), '2026-10-01 23:59:00')
  assert.equal(dueStatus('2026-09-30', 5, now), 'overdue')
  assert.equal(dueStatus('2026-10-01', 0, now), 'duetoday')
  assert.equal(dueStatus('2026-10-06', 5, now), 'duesoon')
  assert.equal(dueStatus('2026-10-07', 5, now), 'normal')
  assert.equal(dueStatus('2026-10-02', 0, now), 'normal')
  assert.equal(dueStatus('2026-02-30', 5, now), '')
  assert.equal(dueStatus(null, 5, now), '')
  assert.equal(matchesStatus('duetoday', 'duesoon'), true)
  assert.equal(matchesStatus('overdue', 'duesoon'), false)
})

test('DataTables reordered columns and sort settings survive React/legacy round trips', async () => {
  const { decodeLayout, encodeLayout } = await import('../src/features/tasks/layout.ts')
  const legacy = JSON.stringify({ ColReorder: [0, 2, 1], columns: [{ visible: true }, { visible: false }, { visible: true }], order: [[1, 'desc']] })
  const layout = decodeLayout(legacy)
  assert.deepEqual(layout.order, [[2, 'desc']])
  assert.equal(layout.columns?.[2].visible, false)
  assert.deepEqual(decodeLayout(encodeLayout(layout)), layout)
  assert.deepEqual(decodeLayout('bad JSON'), {})
  assert.deepEqual(decodeLayout('{"ColReorder":[1,1]}'), {})
})
