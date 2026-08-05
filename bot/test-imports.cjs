const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
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
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }))
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

  if (!ready) { console.log('Server not ready'); child.kill(); process.exit(1) }
  console.log('Server is up!\n')

  // Check App.tsx transpiled output for errors
  console.log('=== App.tsx transpiled check ===')
  const appRes = await fetchUrl('/src/App.tsx')
  const body = appRes.body || ''
  
  // Check for runtime error patterns
  const patterns = [
    'Cannot find',
    'Module not found',
    'is not defined',
    'undefined is not',
    'Unexpected token',
  ]
  for (const p of patterns) {
    if (body.includes(p)) {
      console.log('ERROR FOUND:', p)
      const idx = body.indexOf(p)
      console.log(body.substring(Math.max(0, idx - 80), idx + 150))
    }
  }
  
  // Check if PWAToast import resolves
  console.log('\n=== Checking imports ===')
  const imports = body.match(/import\s+[^]+from\s+["']([^"']+)["']/g) || []
  console.log('Imports found in App.tsx:')
  for (const imp of imports) {
    console.log('  ', imp.trim())
  }

  // Check PWAToast.tsx for issues
  console.log('\n=== PWAToast.tsx check ===')
  const pwaRes = await fetchUrl('/src/components/PWAToast.tsx')
  const pwaBody = pwaRes.body || ''
  const pwaImports = pwaBody.match(/import\s+[^]+from\s+["']([^"']+)["']/g) || []
  console.log('Imports in PWAToast.tsx:')
  for (const imp of pwaImports) {
    console.log('  ', imp.trim())
  }

  // Check if the virtual module is properly resolved
  console.log('\n=== Virtual module resolution ===')
  const virtualRes = await fetchUrl('/@vite-plugin-pwa/virtual:pwa-register/react')
  console.log('virtual:pwa-register/react:', virtualRes.status, virtualRes.body?.length || 0, 'bytes')
  
  // Also check the workbox runtime
  const workboxRes = await fetchUrl('/node_modules/.vite/deps/workbox-window.js')
  console.log('workbox-window:', workboxRes.status, workboxRes.body?.length || 0, 'bytes')

  child.kill()
  process.exit(0)
}

main()
