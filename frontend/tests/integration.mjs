import assert from 'node:assert/strict'
const base = process.env.PILOT_BASE || 'http://127.0.0.1:8098'
if (!/^http:\/\/127\.0\.0\.1:809[89](?:\/grocy(?:\/index\.php)?)?$/.test(base)) throw new Error('Run only against the isolated pilot server on 8098/8099')
await fetch(`${base}/`) // Allow Grocy to initialize this installation's URL/cache configuration.
const login = await fetch(`${base}/login`, { method: 'POST', body: new URLSearchParams({ username: 'pilot-admin', password: 'pilot-test-password', stay_logged_in: 'off' }), redirect: 'manual' })
assert.equal(login.status, 302)
const cookie = login.headers.get('set-cookie')?.split(';')[0]
assert.ok(cookie)
const request = (path, options = {}) => fetch(base + path, { ...options, headers: { Cookie: cookie, ...options.headers }, redirect: 'manual' })
const json = async (path, method = 'GET', body) => {
  const response = await request('/api' + path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) })
  assert.ok(response.ok, `${path}: ${response.status} ${await response.clone().text()}`)
  return response.status === 204 ? undefined : response.json()
}
assert.ok([401, 302].includes((await fetch(`${base}/api/tasks`, { redirect: 'manual' })).status))
const html = await (await request('/tasks')).text()
assert.ok(html.includes('grocy-react-root'))
assert.ok(!html.includes('/viewjs/tasks.js'))
for (const match of html.matchAll(/(?:src|href)="([^"]*\/react\/assets\/[^"]+)"/g)) {
  const asset = await fetch(match[1]); assert.equal(asset.status, 200)
  assert.ok(asset.headers.get('content-type')?.includes(match[1].endsWith('.css') ? 'text/css' : 'javascript'))
  console.log('Asset OK:', new URL(match[1]).pathname)
}
const legacy = await (await request('/tasks?legacy=1')).text()
assert.ok(legacy.includes('/viewjs/tasks.js')); assert.ok(!legacy.includes('grocy-react-root'))
assert.ok(!(await (await request('/stockoverview')).text()).includes('grocy-react-root'))
const category = await json('/objects/task_categories', 'POST', { name: 'Integration pilot category', active: 1, description: 'fixture' })
const task = await json('/objects/tasks', 'POST', { name: 'Integration pilot task', due_date: '2026-10-01', category_id: category.created_object_id, assigned_to_user_id: 1 })
const id = task.created_object_id
const field = await json('/objects/userfields', 'POST', { entity: 'tasks', name: 'integration_note', caption: 'Integration note', type: 'text-single-line', show_as_column_in_tables: 1 })
try {
  await json(`/objects/tasks/${id}`, 'PUT', { name: 'Integration pilot edited' })
  assert.equal((await json(`/objects/tasks/${id}`)).name, 'Integration pilot edited')
  await json(`/userfields/tasks/${id}`, 'PUT', { integration_note: 'Contract verified' })
  assert.equal((await json(`/userfields/tasks/${id}`)).integration_note, 'Contract verified')
  assert.equal((await json('/objects/tasks')).find(task => Number(task.id) === Number(id)).userfields.integration_note, 'Contract verified')
  await json(`/tasks/${id}/complete`, 'POST', { done_time: '2026-10-01 12:34:56' })
  assert.equal((await json(`/objects/tasks/${id}`)).done_timestamp, '2026-10-01 12:34:56')
  assert.equal(Number((await json(`/objects/tasks/${id}`)).done), 1)
  assert.ok(!(await json('/tasks')).some(task => Number(task.id) === Number(id)))
  await json(`/tasks/${id}/undo`, 'POST', {})
  assert.equal(Number((await json(`/objects/tasks/${id}`)).done), 0)
  await json('/user/settings/datatables_state_tasks-table', 'PUT', { value: JSON.stringify({ order: [[1, 'desc']], columns: [] }) })
  assert.ok((await json('/user/settings'))['datatables_state_tasks-table'].includes('desc'))
  await json(`/objects/task_categories/${category.created_object_id}`, 'PUT', { active: 0 })
  assert.equal(Number((await json(`/objects/task_categories/${category.created_object_id}`)).active), 0)
} finally {
  await json(`/objects/tasks/${id}`, 'DELETE', {})
  await json(`/objects/userfields/${field.created_object_id}`, 'DELETE', {})
  await json(`/objects/task_categories/${category.created_object_id}`, 'DELETE', {})
}
console.log('PASS: session authentication, unauthorized API, production assets, legacy fallback, scope isolation, task/category CRUD, completion, undo, settings')

if (base.endsWith(':8098')) {
  const readerLogin = await fetch(`${base}/login`, { method: 'POST', body: new URLSearchParams({ username: 'pilot-reader', password: 'pilot-test-password', stay_logged_in: 'off' }), redirect: 'manual' })
  const readerCookie = readerLogin.headers.get('set-cookie')?.split(';')[0]
  assert.ok(readerCookie)
  const readerPage = await (await fetch(`${base}/tasks`, { headers: { Cookie: readerCookie } })).text()
  const bootstrap = JSON.parse(readerPage.match(/id="grocy-react-bootstrap" type="application\/json">([^<]+)/)[1])
  assert.equal(bootstrap.permissions.MASTER_DATA_EDIT, false)
  assert.equal(bootstrap.permissions.TASKS_MARK_COMPLETED, false)
  const denied = await fetch(`${base}/api/tasks/${id}/complete`, { method: 'POST', body: '{}', headers: { Cookie: readerCookie, 'Content-Type': 'application/json' } })
  assert.equal(denied.status, 403)
  console.log('PASS: restricted-user bootstrap and backend mutation denial')
}
