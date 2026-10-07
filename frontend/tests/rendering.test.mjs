import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { getCurrentTasks } from '../src/api/tasks.ts'
import { decodeTasks } from '../src/features/tasks/taskModel.ts'

// Use the installed Vite transformer for TSX. No browser or new test framework.
const server = await createServer({
  cacheDir: 'node_modules/.vite-tests',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: 'custom',
})
after(() => server.close())
const { TasksContent } = await server.ssrLoadModule('/src/components/tasks/TasksContent.tsx')
const render = (state) => renderToStaticMarkup(createElement(TasksContent, { state, onRetry() {} }))

test('actual migration view excludes completed tasks; the adapter and table show each unfinished ID once', async () => {
  const db = new DatabaseSync(':memory:')
  const originalFetch = globalThis.fetch
  try {
    db.exec(await readFile(new URL('../../migrations/0036.sql', import.meta.url), 'utf8'))
    db.exec(`INSERT INTO tasks (id, name, done, assigned_to_user_id) VALUES
      (11, 'Unassigned task', 0, NULL), (12, 'Other assignee', 0, 9), (13, 'Completed fixture', 1, 9);`)
    const current = db.prepare('SELECT * FROM tasks_current').all()
    assert.deepEqual(current.map((row) => row.id), [11, 12])
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/tasks')
      assert.equal(options.method, 'GET')
      return new Response(JSON.stringify(current.map((row) => ({
        ...row, category: null, assigned_to_user: row.assigned_to_user_id ? { display_name: 'Another user' } : null,
      }))), { headers: { 'Content-Type': 'application/json' } })
    }
    const markup = render({ status: 'success', tasks: await getCurrentTasks() })
    assert.deepEqual([...markup.matchAll(/data-task-id="(\d+)"/g)].map((match) => match[1]), ['11', '12'])
    assert.match(markup, /Another user/)
    assert.doesNotMatch(markup, /Completed fixture|data-task-id="13"/)
    assert.match(markup, /2 unfinished tasks/)
  } finally {
    globalThis.fetch = originalFetch
    db.close()
  }
})

test('empty, loading and error render distinct accessible states; only errors offer Retry', () => {
  const empty = render({ status: 'success', tasks: [] })
  assert.match(empty, /No unfinished tasks/)
  assert.doesNotMatch(empty, /<table|Retry|could not/)
  assert.match(render({ status: 'loading' }), /role="status"[^>]*>Loading tasks/)
  const error = render({ status: 'error', message: 'Sign in, then retry. (HTTP 401)' })
  assert.match(error, /role="alert"/)
  assert.match(error, /HTTP 401/)
  assert.match(error, /<button[^>]*>Retry<\/button>/)
  assert.doesNotMatch(error, /No unfinished tasks|<table/)
})

test('task/relation text is escaped and missing values remain visible', () => {
  const tasks = decodeTasks([{ id: 1, name: '<script>alert(1)</script>', done: '0', due_date: null,
    category_id: 3, category: null, assigned_to_user_id: 4, assigned_to_user: { display_name: '<img src=x onerror=alert(1)>' } }])
  const markup = render({ status: 'success', tasks })
  assert.match(markup, /&lt;script&gt;/)
  assert.match(markup, /&lt;img/)
  assert.doesNotMatch(markup, /<script|<img/)
  assert.match(markup, /No due date/)
  assert.match(markup, /Category unavailable/)
  assert.match(markup, /scope="col"/)
  assert.match(markup, /scope="row"/)
})
