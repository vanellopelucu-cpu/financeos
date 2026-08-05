const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')

const child = spawn('node', ['node_modules/vite/bin/vite.js'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let hasErrors = false

child.stdout.on('data', (data) => {
  const msg = data.toString()
  process.stdout.write(`[STDOUT] ${msg}`)
})

child.stderr.on('data', (data) => {
  const msg = data.toString()
  process.stderr.write(`[STDERR] ${msg}`)
  
  // Check for common error patterns
  if (msg.includes('error') || msg.includes('Error') || msg.includes('failed')) {
    hasErrors = true
  }
})

function waitForServer(maxWait = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const interval = setInterval(() => {
      http.get('http://localhost:5173/', (res) => {
        let body = ''
        res.on('data', (c) => body += c)
        res.on('end', () => {
          clearInterval(interval)
          resolve({ status: res.statusCode, body, headers: res.headers })
        })
      }).on('error', () => {
        if (Date.now() - start > maxWait) {
          clearInterval(interval)
          reject(new Error('Server did not start within timeout'))
        }
      })
    }, 200)
  })
}

async function fetchWithErrors(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${path}`, (res) => {
      let body = ''
      res.on('data', (c) => body += c)
      res.on('end', () => {
        resolve({ status: res.statusCode, body, headers: res.headers })
      })
    }).on('error', (e) => {
      resolve({ status: 0, body: e.message, error: true })
    })
  })
}

async function main() {
  console.log('Starting Vite dev server...')

  try {
    await waitForServer()
    console.log('Server is up!')

    // Test all routes
    const routes = ['/', '/transactions', '/budgets', '/analytics', '/accounts', '/settings', '/notifications']
    for (const route of routes) {
      const result = await fetchWithErrors(route)
      console.log(`\n[${route}] Status: ${result.status}, Length: ${result.body?.length || 0}`)
      if (result.body) {
        const bodyStr = result.body
        // Check for common error patterns
        const errorPatterns = [
          'Cannot find module',
          'Module not found',
          'Unexpected token',
          'SyntaxError',
          'ReferenceError',
          'TypeError',
        ]
        for (const pattern of errorPatterns) {
          if (bodyStr.includes(pattern)) {
            console.log(`  ❌ ERROR: ${pattern}`)
            const idx = bodyStr.indexOf(pattern)
            console.log('  Context:', bodyStr.substring(Math.max(0, idx - 50), idx + 100))
          }
        }
      }
    }

    // Also check some JS modules
    console.log('\n=== Checking JS modules ===')
    const modules = [
      '/src/main.tsx',
      '/src/App.tsx',
      '/src/lib/supabase.ts',
      '/src/lib/realtime.ts',
      '/src/app/store/index.ts',
      '/src/pages/Budgets.tsx',
    ]
    for (const mod of modules) {
      const result = await fetchWithErrors(mod)
      console.log(`[${mod}] Status: ${result.status}, Length: ${result.body?.length || 0}`)
      if (result.body && result.body.length > 0) {
        const errorPatterns = [
          'Cannot find',
          'Module not found',
          'Unexpected token',
          'SyntaxError',
          'is not defined',
        ]
        for (const pattern of errorPatterns) {
          if (result.body.includes(pattern)) {
            console.log(`  ❌ ERROR: ${pattern}`)
            const idx = result.body.indexOf(pattern)
            console.log('  Context:', result.body.substring(Math.max(0, idx - 50), idx + 100))
          }
        }
      }
    }

  } catch (e) {
    console.error('Test failed:', e.message)
  } finally {
    console.log('\nShutting down dev server...')
    child.kill()
    console.log('Errors detected:', hasErrors)
    process.exit(0)
  }
}

main()
