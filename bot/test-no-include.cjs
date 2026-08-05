const { spawn } = require('child_process')
const http = require('http')
const path = require('path')
const fs = require('fs')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
const configPath = path.join(projectRoot, 'vite.config.ts')

// Read current config
const currentConfig = fs.readFileSync(configPath, 'utf8')

// Create config WITHOUT includeAssets
const noIncludeConfig = currentConfig.replace(
  "includeAssets: ['favicon.svg', 'robots.txt'],",
  ""
)

// Write the modified config
fs.writeFileSync(configPath, noIncludeConfig)
console.log('Removed includeAssets from vite.config.ts')

// Start Vite
const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let stderr = ''
child.stderr.on('data', (d) => {
  stderr += d.toString()
  process.stderr.write('[VITE-ERR] ' + d.toString())
})

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

  if (!ready) {
    console.log('Server not ready')
    console.log('STDERR:', stderr)
  } else {
    console.log('Server is up without includeAssets!')
    
    // Test the App and all routes
    const routes = ['/', '/budgets', '/analytics', '/accounts', '/transactions', '/notifications', '/settings']
    for (const route of routes) {
      const res = await fetchUrl(route)
      console.log(`[${route}] Status: ${res.status}, Length: ${res.body?.length || 0}`)
    }
    
    // Check App.tsx module
    const appRes = await fetchUrl('/src/App.tsx')
    console.log(`\n[App.tsx] Status: ${appRes.status}, Length: ${appRes.body?.length || 0}`)
    const body = appRes.body || ''
    if (body.includes('Cannot find') || body.includes('Module not found')) {
      console.log('  ERROR: Module not found!')
    }
  }

  child.kill()

  // Restore original config
  fs.writeFileSync(configPath, currentConfig)
  console.log('\nRestored original vite.config.ts')

  process.exit(0)
}

main()
