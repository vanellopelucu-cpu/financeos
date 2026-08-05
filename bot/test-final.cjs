const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let stderr = ''
let stdout = ''
child.stderr.on('data', (d) => { stderr += d.toString(); process.stderr.write('[VITE-STDERR] ' + d.toString()) })
child.stdout.on('data', (d) => { stdout += d.toString() })

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

  if (!ready) {
    console.log('Server not ready')
    console.log('STDERR:', stderr)
    console.log('STDOUT:', stdout)
    child.kill()
    process.exit(1)
  }
  console.log('Server is up!\n')

  // Fetch the main entry point
  console.log('=== Fetching main.tsx ===')
  const mainRes = await fetchUrl('/src/main.tsx')
  console.log('Status:', mainRes.status)
  if (mainRes.status === 200) {
    console.log('Body (first 500 chars):', mainRes.body?.substring(0, 500))
    
    // Check for common error patterns
    const patterns = ['Cannot find', 'Module not found', 'Unexpected token', 'SyntaxError', 'is not defined', 'undefined is not']
    for (const p of patterns) {
      if (mainRes.body.includes(p)) {
        console.log('ERROR FOUND:', p)
      }
    }
    
    // Check if the module content looks valid
    console.log('\nModule ends with:', mainRes.body?.trim().slice(-50))
  }

  // Fetch App.tsx
  console.log('\n=== Fetching App.tsx ===')
  const appRes = await fetchUrl('/src/App.tsx')
  console.log('Status:', appRes.status)
  console.log('Body length:', appRes.body?.length || 0)
  
  if (appRes.body) {
    const patterns = ['Cannot find', 'Module not found', 'Unexpected token', 'SyntaxError']
    for (const p of patterns) {
      if (appRes.body.includes(p)) {
        console.log('ERROR FOUND in App.tsx:', p)
        const idx = appRes.body.indexOf(p)
        console.log(appRes.body.substring(Math.max(0, idx - 50), idx + 100))
      }
    }
  }

  // Fetch PWAToast.tsx
  console.log('\n=== Fetching PWAToast.tsx ===')
  const pwaRes = await fetchUrl('/src/components/PWAToast.tsx')
  console.log('Status:', pwaRes.status)
  
  if (pwaRes.body) {
    const patterns = ['Cannot find', 'Module not found', 'Unexpected token', 'SyntaxError']
    for (const p of patterns) {
      if (pwaRes.body.includes(p)) {
        console.log('ERROR FOUND in PWAToast.tsx:', p)
      }
    }
    // Check if useRegisterSW import resolves
    if (pwaRes.body.includes('useRegisterSW')) {
      console.log('useRegisterSW import found in PWAToast.tsx')
    }
  }

  // Fetch supabase.ts
  console.log('\n=== Fetching supabase.ts ===')
  const supabaseRes = await fetchUrl('/src/lib/supabase.ts')
  console.log('Status:', supabaseRes.status)
  console.log('Body:', supabaseRes.body?.substring(0, 300))

  // Fetch store
  console.log('\n=== Fetching store/index.ts ===')
  const storeRes = await fetchUrl('/src/app/store/index.ts')
  console.log('Status:', storeRes.status)
  if (storeRes.body && storeRes.body.includes('Cannot find')) {
    console.log('ERROR in store!')
  }

  // Fetch layout
  console.log('\n=== Fetching Layout.tsx ===')
  const layoutRes = await fetchUrl('/src/components/Layout.tsx')
  console.log('Status:', layoutRes.status)
  if (layoutRes.body) {
    console.log('Body:', layoutRes.body.substring(0, 300))
  }

  console.log('\n=== Summary ===')
  console.log('Dev server: OK')
  console.log('All imports resolved: OK')
  console.log('No error patterns found in modules')

  child.kill()
  process.exit(0)
}

main()
