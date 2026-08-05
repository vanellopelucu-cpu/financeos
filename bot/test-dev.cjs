const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const BOT_DIR = path.resolve(__dirname)
const projectRoot = path.dirname(BOT_DIR)

const child = spawn('node', ['node_modules/vite/bin/vite.js'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let viteOutput = ''
child.stdout.on('data', (data) => {
  viteOutput += data.toString()
  process.stdout.write(`[VITE] ${data.toString()}`)
})
child.stderr.on('data', (data) => {
  viteOutput += data.toString()
  process.stderr.write(`[VITE-ERR] ${data.toString()}`)
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

async function fetchModule(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${urlPath}`, (res) => {
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
    const result = await waitForServer()
    console.log('\n=== index.html ===')
    console.log('Status:', result.status)
    console.log('Content-Type:', result.headers['content-type'])
    console.log('Body length:', result.body.length)
    console.log('Has app div:', result.body.includes('id="app"'))
    console.log('Body:', result.body)

    console.log('\n=== /src/main.tsx ===')
    const mainTsx = await fetchModule('/src/main.tsx')
    console.log('Status:', mainTsx.status)
    console.log('Body length:', mainTsx.body?.length || 0)
    console.log('Has error:', (mainTsx.body || '').toLowerCase().includes('error'))
    console.log('Preview:', (mainTsx.body || '').substring(0, 500))

    console.log('\n=== /src/App.tsx ===')
    const appTsx = await fetchModule('/src/App.tsx')
    console.log('Status:', appTsx.status)
    console.log('Body length:', appTsx.body?.length || 0)
    console.log('Has error:', (appTsx.body || '').toLowerCase().includes('error'))

    console.log('\n=== /src/App.tsx import ===')
    const appImport = await fetchModule('/src/App.tsx')
    console.log('Status:', appImport.status)
    console.log('Has import error (Cannot/find):', (appImport.body || '').includes('Cannot') || (appImport.body || '').includes('find'))

  } catch (e) {
    console.error('Server test failed:', e.message)
    console.log('Vite output:', viteOutput)
  } finally {
    console.log('\nShutting down dev server...')
    child.kill()
    process.exit(0)
  }
}

main()
