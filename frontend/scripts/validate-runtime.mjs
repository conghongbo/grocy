import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, writeFile, readFile, access, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const manifest = JSON.parse(await readFile(resolve(root, 'public/react/.vite/manifest.json'), 'utf8'))
const entry = manifest['src/main.tsx']
assert.ok(entry?.isEntry, 'Run npm run build --prefix frontend first')
const asset = await readFile(resolve(root, 'public/react', entry.file))

for (const basePath of ['', '/fixture']) {
  const fixture = await mkdtemp(resolve(tmpdir(), 'grocy-react-fixture-'))
  let server
  let output = ''
  try {
    await writeFile(resolve(fixture, '.react-fixture'), 'Temporary integration fixture\n')
    // No existing config or database is copied. Normal migrations create the schema/admin user.
    await writeFile(resolve(fixture, 'config.php'), `<?php
      define('GROCY_MODE', 'production');
      define('GROCY_DISABLE_AUTH', false);
      define('GROCY_AUTH_CLASS', 'Grocy\\Middleware\\DefaultAuthMiddleware');
      define('GROCY_BASE_PATH', '${basePath}');
      define('GROCY_BASE_URL', '${basePath || '/'}');
      define('GROCY_DISABLE_URL_REWRITING', false);
    `)
    const socket = createServer()
    socket.listen(0, '127.0.0.1')
    await once(socket, 'listening')
    const port = socket.address().port
    await new Promise((done) => socket.close(done))
    const origin = `http://127.0.0.1:${port}`
    // Remove inherited installation settings, including DATAPATH and auth overrides.
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GROCY_')))
    server = spawn(process.env.PHP_BINARY || 'php', ['-S', `127.0.0.1:${port}`, '-t', fixture,
      resolve(root, 'frontend/scripts/runtime-router.php')], {
      env: { ...env, GROCY_REACT_FIXTURE: fixture, GROCY_REACT_BASE_PATH: basePath },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let spawnError
    server.on('error', (error) => { spawnError = error })
    server.stdout.on('data', (data) => { output += data })
    server.stderr.on('data', (data) => { output += data })
    const request = (path, options = {}) => fetch(origin + basePath + path, {
      ...options, redirect: 'manual', signal: AbortSignal.timeout(15000),
    })
    let ready = false
    for (let attempt = 0; attempt < 50; attempt++) {
      if (spawnError) throw spawnError
      if (server.exitCode !== null) throw new Error('PHP server exited before becoming ready')
      try { await request('/'); ready = true; break } catch { await delay(100) }
    }
    assert.ok(ready, 'PHP server did not start')
    // The first request invalidates the view cache; the next runs normal schema migrations.
    const initialized = await request('/')
    assert.equal(initialized.status, 302, 'Fresh database migration/root redirect')
    await access(resolve(fixture, 'grocy.db'))
    const anonymous = await request('/react')
    assert.equal(anonymous.status, 302)
    assert.equal(new URL(anonymous.headers.get('location'), origin).pathname, basePath + '/login')
    const loginPage = await request('/login')
    assert.equal(loginPage.status, 200, 'Login page must not redirect to itself')
    assert.match(await loginPage.text(), /id="login-form"/)
    const login = await request('/login', {
      method: 'POST', body: new URLSearchParams({ username: 'admin', password: 'admin', stay_logged_in: 'off' }),
    })
    assert.equal(login.status, 302)
    assert.equal(new URL(login.headers.get('location'), origin).pathname, basePath + '/')
    const cookie = login.headers.get('set-cookie')?.split(';')[0]
    assert.ok(cookie, 'Successful login must create a session cookie')
    const authenticated = { headers: { Cookie: cookie } }
    const page = await request('/react', authenticated)
    assert.equal(page.status, 200)
    const html = await page.text()
    assert.match(html, /id="grocy-react-root"/)
    assert.match(html, /grocy_menu_layout\.js/)
    assert.ok(html.includes(`${basePath}/react/${entry.file}`), 'Manifest asset URL')
    assert.match(html, /type="module"/)
    assert.ok(!html.includes('/viewjs/react.js'), 'No nonexistent legacy React page script')
    const bundle = await request('/react/' + entry.file)
    assert.equal(bundle.status, 200)
    assert.match(bundle.headers.get('content-type'), /javascript/)
    assert.deepEqual(Buffer.from(await bundle.arrayBuffer()), asset, 'Served production bundle matches build')
    for (const css of entry.css ?? []) {
      const response = await request('/react/' + css)
      assert.equal(response.status, 200)
      assert.match(response.headers.get('content-type'), /css/)
    }
    const legacy = await request('/tasks', authenticated)
    assert.equal(legacy.status, 200)
    const legacyHtml = await legacy.text()
    assert.ok(legacyHtml.includes('/viewjs/tasks.js'))
    assert.ok(!legacyHtml.includes('grocy-react-root') && !legacyHtml.includes(entry.file))
    const logout = await request('/logout', authenticated)
    assert.equal(logout.status, 302)
    assert.equal((await request('/react', authenticated)).status, 302, 'Logged-out session cannot access React')
    console.log(`PASS ${basePath || '/'}: fresh migrations, login, anonymous redirect, authenticated Blade mount, production bundle, legacy Tasks shell, logout`)
  } catch (error) {
    console.error(output)
    throw error
  } finally {
    if (server && server.exitCode === null && server.pid) {
      const exited = once(server, 'exit')
      server.kill('SIGTERM')
      await exited
    }
    await rm(fixture, { recursive: true, force: true })
  }
}
console.log('PASS: temporary databases/config/cache removed; no live data used')
