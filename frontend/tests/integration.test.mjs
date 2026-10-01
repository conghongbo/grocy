import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { register } from 'tsx/esm/api'

register({ tsconfig: fileURLToPath(new URL('../tsconfig.app.json', import.meta.url)) })
import { JSDOM } from 'jsdom'
import { createElement } from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator })
const { act, cleanup, fireEvent, render, within } = await import('@testing-library/react')
const { default: App } = await import('../src/App.tsx')

test('integration check renders an accessible heading and responds to repeated clicks', () => {
  try {
    const page = render(createElement(App))
    assert.equal(page.getByRole('heading', { name: 'React integration' }).id, 'react-page-title')
    const button = page.getByRole('button', { name: 'Integration check: 0' })
    fireEvent.click(button)
    fireEvent.click(button)
    assert.equal(button.textContent.trim(), 'Integration check: 2')
  } finally {
    cleanup()
  }
})

test('entry safely does nothing on a legacy page without the React mount', async () => {
  document.body.innerHTML = '<main id="legacy">Legacy content</main>'
  const before = document.body.innerHTML
  await act(async () => { await import('../src/main.tsx?legacy') })
  assert.equal(document.body.innerHTML, before)
})

test('entry mounts an interactive page while retaining surrounding Blade content', async () => {
  document.body.innerHTML = '<nav id="shell">Grocy navigation</nav><div id="grocy-react-root"></div>'
  const shell = document.getElementById('shell')
  await act(async () => { await import('../src/main.tsx?mount') })
  const mount = within(document.getElementById('grocy-react-root'))
  const button = mount.getByRole('button', { name: 'Integration check: 0' })
  fireEvent.click(button)
  assert.equal(button.textContent.trim(), 'Integration check: 1')
  assert.equal(document.getElementById('shell'), shell)
  assert.equal(shell.textContent, 'Grocy navigation')
})
