const { spawn } = require('child_process')
const http = require('http')
const path = require('path')
const fs = require('fs')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
const configPath = path.join(projectRoot, 'vite.config.ts')

const original = fs.readFileSync(configPath, 'utf8')
// Test removing robots.txt from includeAssets
const fixedConfig = original.replace(
  "includeAssets: ['favicon.svg', 'robots.txt'],",
  "includeAssets: ['favicon.svg'],"
)

fs.writeFileSync(configPath, fixedConfig)
console.log('Fixed: removed robots.txt from includeAssets')

const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})
child.stderr.on('data', (d) => process.stderr.write('[VITE-ERR] ' + d.toString()))

function fetchUrl(urlPath) {
  return new Promise((resolve) => {
    http.get('http://localhost:5173' + urlPath, (res) => {
      let body = ''
      res.on('data', (c) => body += c)
      res.on('end', () => resolve({ status: res.statusCode, body }))
    }).on('error', (e) => resolve({ status: 0, body: e.message, error: true }))
  })
}

async function main() {
  let ready = false
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetchUrl('/')
      if (res.status === 200) { ready = true; break }
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }

  if (!ready) { console.log('Server not ready'); child.kill(); fs.writeFileSync(configPath, original); process.exit(1) }
  console.log('Server is up with fixed config!')

  const routes = ['/', '/budgets', '/analytics', '/accounts', '/transactions', '/notifications', '/settings']
  for (const route of routes) {
    const res = await fetchUrl(route)
    console.log(`[${route}] Status: ${res.status}`)
  }

  child.kill()

  // Restore original config
  fs.writeFileSync(configPath, original)
  console.log('\nRestored original config')

  process.exit(0)
}

main()
