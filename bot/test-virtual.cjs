const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'

const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

child.stdout.on('data', (data) => { process.stdout.write('[VITE] ' + data.toString()) })
child.stderr.on('data', (data) => { process.stderr.write('[VITE-ERR] ' + data.toString()) })

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
  // Wait for server
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
    console.log('Vite output:', viteOutput)
    child.kill()
    process.exit(1)
  }
  console.log('Server is up!')

  // Check PWAToast module
  const pwaRes = await fetchUrl('/src/components/PWAToast.tsx')
  console.log('\n=== PWAToast.tsx ===')
  console.log('Status:', pwaRes.status)
  console.log('Body length:', pwaRes.body?.length || 0)

  const body = pwaRes.body || ''
  const errorPatterns = ['Cannot find', 'Module not found', 'Unexpected', 'SyntaxError']
  for (const p of errorPatterns) {
    if (body.includes(p)) {
      console.log(`ERROR: ${p}`)
      const idx = body.indexOf(p)
      console.log('Context:', body.substring(Math.max(0, idx - 100), idx + 200))
    }
  }

  // Check import lines
  const lines = body.split('\n')
  for (const line of lines) {
    if (line.includes('import') || line.includes('useRegister')) {
      console.log('  ', line.trim())
    }
  }

  // Check virtual module
  console.log('\n=== Virtual module check ===')
  const v1 = await fetchUrl('/src/components/PWAToast.tsx?import')
  console.log('PWAToast with import query:', v1.status, v1.body?.length || 0, 'bytes')

  // Check if vite client works
  const clientRes = await fetchUrl('/@vite/client')
  console.log('@vite/client:', clientRes.status, clientRes.body?.length || 0, 'bytes')

  child.kill()
  process.exit(0)
}

let viteOutput = ''
child.stdout.on('data', (data) => { viteOutput += data.toString() })

main()
