const { spawn } = require('child_process')
const http = require('http')
const path = require('path')
const fs = require('fs')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
const configPath = path.join(projectRoot, 'vite.config.ts')
const backupPath = path.join(projectRoot, 'vite.config.ts.bak')

// Read current config
const currentConfig = fs.readFileSync(configPath, 'utf8')

// Create minimal config without VitePWA
const minimalConfig = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})
`

// Backup and write minimal config
fs.copyFileSync(configPath, backupPath)
fs.writeFileSync(configPath, minimalConfig)
console.log('Replaced vite.config.ts with minimal config')

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
    console.log('Server not ready with minimal config')
    console.log('STDERR:', stderr)
  } else {
    console.log('Server is up with minimal config!')
    const res = await fetchUrl('/')
    console.log('index.html status:', res.status)
    console.log('index.html length:', res.body?.length || 0)
    console.log('Has error:', (res.body || '').toLowerCase().includes('error'))
  }

  child.kill()

  // Restore original config
  fs.copyFileSync(backupPath, configPath)
  fs.unlinkSync(backupPath)
  console.log('\nRestored original vite.config.ts')

  process.exit(0)
}

main()
