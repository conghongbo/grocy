import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiRequest, post, ApiError } from '../src/api/client.ts'

test('uses the existing API, session credentials and JSON headers', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/stock')
    assert.equal(options?.credentials, 'same-origin')
    assert.equal(new Headers(options?.headers).get('Accept'), 'application/json')
    return new Response('[{"amount":"2"}]')
  }
  assert.deepEqual(await apiRequest('/stock'), [{ amount: '2' }])
})
test('handles empty successful responses from task completion and undo', async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options?.method, 'POST')
    assert.equal(new Headers(options?.headers).get('Content-Type'), 'application/json')
    assert.equal(options?.body, '{"done_time":"2026-10-01 12:00:00"}')
    return new Response(null, { status: 204 })
  }
  assert.equal(await post('/tasks/1/complete', { done_time: '2026-10-01 12:00:00' }), undefined)
})
test('preserves backend validation errors', async () => {
  globalThis.fetch = async () => new Response('{"error_message":"Insufficient stock"}', { status: 400 })
  await assert.rejects(apiRequest('/stock'), error => error instanceof ApiError && error.status === 400 && error.message === 'Insufficient stock')
})
test('reports expired sessions and unexpected HTML without pretending success', async () => {
  globalThis.fetch = async () => new Response('', { status: 401 })
  await assert.rejects(apiRequest('/tasks'), /session expired/)
  globalThis.fetch = async () => new Response('<html>Login</html>')
  await assert.rejects(apiRequest('/tasks'), /Unexpected server response/)
})
test('forwards cancellation signals', async () => {
  const controller = new AbortController()
  globalThis.fetch = async (_url, options) => {
    assert.equal(options?.signal, controller.signal)
    throw new DOMException('Aborted', 'AbortError')
  }
  await assert.rejects(apiRequest('/chores', { signal: controller.signal }), /Aborted/)
})
