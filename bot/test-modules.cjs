const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'

const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let stderrOutput = ''
child.stderr.on('data', (data) => {
  stderrOutput += data.toString()
  process.stderr.write(`[VITE-ERR] ${data.toString()}`)
})
child.stdout.on('data', () => {})

function fetchUrl(urlPath) {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173' + urlPath, (res) => {
      let body = ''
      res.on('data', (c) => body += c)
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }))
    }).on('error', (e) => resolve({ status: 0, body: e.message, error: true }))
  })
}

async function main() {
  console.log('Starting Vite dev server...')

  let ready = false
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetchUrl('/')
      if (res.status === 200) { ready = true; break }
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }

  if (!ready) {
    console.log('Server not ready')
    console.log('STDERR:', stderrOutput)
    child.kill()
    process.exit(1)
  }
  console.log('Server is up!\n')

  console.log('=== Module Loading Check ===')
  const modules = [
    { path: '/src/main.tsx', name: 'main.tsx' },
    { path: '/src/App.tsx', name: 'App.tsx' },
    { path: '/src/app/store/index.ts', name: 'store' },
    { path: '/src/lib/supabase.ts', name: 'supabase' },
    { path: '/src/lib/realtime.ts', name: 'realtime' },
    { path: '/src/pages/Budgets.tsx', name: 'Budgets' },
    { path: '/src/components/PWAToast.tsx', name: 'PWAToast' },
    { path: '/src/app/providers/WorkspaceContext.tsx', name: 'WorkspaceContext' },
  ]

  for (const mod of modules) {
    const res = await fetchUrl(mod.path)
    const body = res.body || ''
    const hasError = body.includes('Cannot find') || body.includes('Module not found') ||
                     body.includes('SyntaxError') || body.includes('Unexpected token')
    console.log(`${mod.name}: status=${res.status}, bytes=${body.length}, error=${hasError}`)
    if (hasError) {
      const idx = body.indexOf('Cannot')
      console.log('  Error context:', body.substring(Math.max(0, idx - 50), idx + 200))
    }
  }

  console.log('\n=== Vite stderr check ===')
  console.log('STDERR length:', stderrOutput.length)
  if (stderrOutput.length > 0) {
    console.log('STDERR:', stderrOutput.substring(0, 2000))
  }

  console.log('\n=== main.tsx imports ===')
  const mainRes = await fetchUrl('/src/main.tsx')
  const lines = (mainRes.body || '').split('\n')
  for (const line of lines) {
    if (line.includes('import')) {
      console.log(line.trim())
    }
  }

  child.kill()
  process.exit(0)
}

main()
