import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { setImmediate } from 'node:timers/promises'
import { apiRequest, ApiError } from '../src/api/client.ts'
import { getCurrentTasks } from '../src/api/tasks.ts'
import { assigneeLabel, categoryLabel, decodeTasks, dueDateLabel } from '../src/features/tasks/taskModel.ts'
import { startTasksRead } from '../src/features/tasks/tasksRequest.ts'
import type { TasksState } from '../src/features/tasks/tasksRequest.ts'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 1, name: 'Take out recycling', done: 0, due_date: '2026-10-05 00:00:00',
  category_id: null, assigned_to_user_id: null, category: null, assigned_to_user: null,
  ...overrides,
})
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8' },
})

test('current list makes one GET, with session credentials and no filters or writes', async () => {
  const controller = new AbortController()
  const calls: unknown[] = []
  globalThis.fetch = async (url, options) => {
    calls.push(url)
    assert.equal(url, '/api/tasks')
    assert.equal(options?.method, 'GET')
    assert.equal(options?.credentials, 'same-origin')
    assert.equal(options?.body, undefined)
    assert.equal(options?.signal, controller.signal)
    assert.equal(new Headers(options?.headers).get('accept'), 'application/json')
    assert.equal(new Headers(options?.headers).get('grocy-api-key'), null)
    return json([row(), row({ id: '2', done: '0', assigned_to_user_id: '8', assigned_to_user: { username: 'another-user' } })])
  }
  const tasks = await getCurrentTasks(controller.signal)
  assert.deepEqual(tasks.map((task) => task.id), [1, 2])
  assert.equal(assigneeLabel(tasks[1]), 'another-user')
  assert.equal(calls.length, 1)
})

test('suffix contract rejects double /api prefixes and absolute URLs before fetch', async () => {
  globalThis.fetch = async () => { assert.fail('fetch must not run') }
  for (const endpoint of ['/api/tasks', '/api', 'tasks', '//example.org/tasks', 'https://example.org/tasks']) {
    await assert.rejects(apiRequest(endpoint), /exclude the \/api prefix/)
  }
})

test('empty HTML 401 is an actionable authentication error with status', async () => {
  globalThis.fetch = async () => new Response('', { status: 401, headers: { 'Content-Type': 'text/html' } })
  await assert.rejects(getCurrentTasks(), (error) => error instanceof ApiError && error.status === 401 && /Sign in.*retry/.test(error.message))
})

test('JSON 500 preserves error_message and status without exposing exception details', async () => {
  globalThis.fetch = async () => json({ error_message: 'Database unavailable', exception: { trace: 'PRIVATE TRACE' } }, 500)
  await assert.rejects(getCurrentTasks(), (error) => error instanceof ApiError && error.status === 500 && error.message === 'Database unavailable (HTTP 500)')
})

test('non-JSON 500 never displays an HTML error body', async () => {
  globalThis.fetch = async () => new Response('<html>Private stack trace</html>', { status: 500 })
  await assert.rejects(getCurrentTasks(), (error) => error instanceof ApiError && error.status === 500 && !error.message.includes('Private'))
})

test('unexpected successful HTML and malformed JSON are response errors', async () => {
  for (const [body, type] of [['<html>Login</html>', 'text/html'], ['{broken', 'application/json']]) {
    globalThis.fetch = async () => new Response(body, { headers: { 'Content-Type': type } })
    await assert.rejects(getCurrentTasks(), (error) => error instanceof ApiError && error.kind === 'invalid-response' && /unexpected response/.test(error.message))
  }
})

test('network and response-body failures are usable connection errors', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(getCurrentTasks(), (error) => error instanceof ApiError && error.kind === 'network')
  globalThis.fetch = async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error('Disconnected')) } }))
  await assert.rejects(getCurrentTasks(), /Check your connection/)
})

test('abort is preserved instead of converted into a network failure', async () => {
  const controller = new AbortController()
  const aborted = new DOMException('Aborted', 'AbortError')
  globalThis.fetch = async () => { controller.abort(); throw aborted }
  await assert.rejects(getCurrentTasks(controller.signal), (error) => error === aborted)
})

test('decoder preserves every ID/order and normalizes numeric strings without an assignee filter', () => {
  const tasks = decodeTasks([row({ id: '42', done: '0' }), row({ id: 3, assigned_to_user_id: '8' })])
  assert.deepEqual(tasks.map((task) => task.id), [42, 3])
  assert.equal(tasks[1].assignedToUserId, 8)
  assert.deepEqual(decodeTasks([]), [])
})

test('decoder rejects wrong envelopes, duplicate IDs and completed rows from an incorrect endpoint', () => {
  for (const payload of [{ data: [] }, null, [row(), row()], [row({ done: '1' })], [row({ done: 1 })], [row({ done: false })]]) {
    assert.throws(() => decodeTasks(payload), ApiError)
  }
})

test('malformed required fields fail visibly rather than silently dropping rows', () => {
  for (const overrides of [{ id: 'abc' }, { id: '' }, { id: 0 }, { id: true }, { name: {} }, { due_date: 3 }, { category_id: 'bad' }]) {
    assert.throws(() => decodeTasks([row(overrides)]), ApiError)
  }
})

test('missing, inactive, deleted and unassigned relations render explicit fallbacks', () => {
  const tasks = decodeTasks([
    row({ due_date: null }),
    row({ id: 2, category_id: '7', assigned_to_user_id: 8, category: undefined, assigned_to_user: false }),
    row({ id: 3, category_id: 0, assigned_to_user_id: '0', category: {}, assigned_to_user: {} }),
  ])
  assert.equal(categoryLabel(tasks[0]), 'Uncategorized')
  assert.equal(assigneeLabel(tasks[0]), 'Unassigned')
  assert.equal(dueDateLabel(tasks[0]), 'No due date')
  assert.equal(categoryLabel(tasks[1]), 'Category unavailable')
  assert.equal(assigneeLabel(tasks[1]), 'User unavailable')
  assert.equal(categoryLabel(tasks[2]), 'Uncategorized')
  assert.equal(assigneeLabel(tasks[2]), 'Unassigned')
})

test('category and user names match enriched DTOs and legacy name fallbacks', () => {
  for (const [user, expected] of [
    [{ display_name: 'Display name', first_name: 'Other', username: 'login' }, 'Display name'],
    [{ first_name: 'Ada', last_name: 'Lovelace' }, 'Ada Lovelace'],
    [{ first_name: '', last_name: 'Lovelace' }, 'Lovelace'],
    [{ first_name: 'Ada', last_name: null }, 'Ada'],
    [{ username: 'login' }, 'login'],
  ] as const) {
    const task = decodeTasks([row({ category: { name: 'Home' }, assigned_to_user: user })])[0]
    assert.equal(categoryLabel(task), 'Home')
    assert.equal(assigneeLabel(task), expected)
  }
})

test('date display retains the API calendar date without a timezone conversion', () => {
  for (const date of ['2026-10-05', '2026-10-05 00:00:00', '2026-10-05T00:00:00Z']) {
    assert.equal(dueDateLabel(decodeTasks([row({ due_date: date })])[0]), '2026-10-05')
  }
})

test('request lifecycle emits loading, usable error, then success after retry', async () => {
  const states: TasksState[] = []
  globalThis.fetch = async () => json({ error_message: 'Temporary failure' }, 500)
  const cleanup = startTasksRead((state) => states.push(state))
  await setImmediate()
  assert.deepEqual(states.map((state) => state.status), ['loading', 'error'])
  cleanup()
  globalThis.fetch = async () => json([row()])
  const cleanupRetry = startTasksRead((state) => states.push(state))
  await setImmediate()
  assert.deepEqual(states.map((state) => state.status), ['loading', 'error', 'loading', 'success'])
  cleanupRetry()
})

test('unmount aborts the request and ignores late successful responses', async () => {
  let resolve!: (response: Response) => void
  let signal: AbortSignal | null | undefined
  globalThis.fetch = async (_url, options) => {
    signal = options?.signal
    return new Promise<Response>((done) => { resolve = done })
  }
  const states: TasksState[] = []
  const cleanup = startTasksRead((state) => states.push(state))
  cleanup()
  assert.equal(signal?.aborted, true)
  resolve(json([row()]))
  await setImmediate()
  assert.deepEqual(states, [{ status: 'loading' }])
})

test('superseded request cannot replace newer results, even if it ignores abort', async () => {
  let resolveOld!: (response: Response) => void
  globalThis.fetch = async () => new Promise<Response>((done) => { resolveOld = done })
  const states: TasksState[] = []
  const cleanupOld = startTasksRead((state) => states.push(state))
  cleanupOld()
  globalThis.fetch = async () => json([row({ id: 2, name: 'New response' })])
  const cleanupNew = startTasksRead((state) => states.push(state))
  await setImmediate()
  resolveOld(json([row({ name: 'Stale response' })]))
  await setImmediate()
  assert.deepEqual(states.map((state) => state.status), ['loading', 'loading', 'success'])
  const last = states.at(-1)
  assert.equal(last?.status === 'success' && last.tasks[0].name, 'New response')
  cleanupNew()
})

test('late errors after cleanup do not overwrite a newer success', async () => {
  let rejectOld!: (error: Error) => void
  globalThis.fetch = async () => new Promise<Response>((_done, fail) => { rejectOld = fail })
  const states: TasksState[] = []
  const cleanupOld = startTasksRead((state) => states.push(state))
  cleanupOld()
  globalThis.fetch = async () => json([])
  const cleanupNew = startTasksRead((state) => states.push(state))
  await setImmediate()
  rejectOld(new TypeError('Late network failure'))
  await setImmediate()
  assert.deepEqual(states.map((state) => state.status), ['loading', 'loading', 'success'])
  cleanupNew()
})
