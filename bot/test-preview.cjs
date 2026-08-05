const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')

const child = spawn('node', ['node_modules/vite/bin/vite.js', 'preview'], {
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
      http.get('http://localhost:4173/', (res) => {
        let body = ''
        res.on('data', (c) => body += c)
        res.on('end', () => {
          clearInterval(interval)
          resolve({ status: res.statusCode, body, headers: res.headers })
        })
      }).on('error', () => {
        if (Date.now() - start > maxWait) {
          clearInterval(interval)
          reject(new Error('Preview server did not start within timeout'))
        }
      })
    }, 200)
  })
}

async function main() {
  console.log('Starting Vite preview server...')
  try {
    const result = await waitForServer()
    console.log('\n=== index.html ===')
    console.log('Status:', result.status)
    console.log('Body length:', result.body.length)
    console.log('Has app div:', result.body.includes('id="app"'))

    // Now check the JS bundle for errors
    const jsMatch = result.body.match(/src="([^"]+\.js)"/)
    if (jsMatch) {
      console.log('\n=== Main JS Bundle ===')
      const jsUrl = jsMatch[1]
      const jsResult = await new Promise((resolve) => {
        http.get(`http://localhost:4173${jsUrl}`, (res) => {
          let body = ''
          res.on('data', (c) => body += c)
          res.on('end', () => {
            resolve({ status: res.statusCode, body, length: body.length })
          })
        }).on('error', (e) => {
          resolve({ status: 0, body: e.message, length: 0 })
        })
      })
      console.log('Status:', jsResult.status)
      console.log('Body length:', jsResult.length)

      // Check for common runtime errors
      const errorPatterns = [
        'Cannot read properties of undefined',
        'is not a function',
        'Unexpected token',
        'Cannot find module',
      ]
      const body = jsResult.body || ''
      for (const pattern of errorPatterns) {
        if (body.includes(pattern)) {
          console.log(`⚠️  Found potential error pattern: ${pattern}`)
          const idx = body.indexOf(pattern)
          console.log('Context:', body.substring(Math.max(0, idx - 100), idx + 200))
        }
      }
    }
  } catch (e) {
    console.error('Test failed:', e.message)
    console.log('Vite output:', viteOutput)
  } finally {
    console.log('\nShutting down preview server...')
    child.kill()
    process.exit(0)
  }
}

main()
