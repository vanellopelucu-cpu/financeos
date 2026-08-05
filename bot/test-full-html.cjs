const http = require('http')
const { spawn } = require('child_process')
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
      res.on('end', () => resolve({
        status: res.statusCode,
        body,
        headers: res.headers,
      }))
    }).on('error', (e) => resolve({ status: 0, body: e.message, headers: {} }))
  })
}

async function main() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetchUrl('/')
      if (res.status === 200) break
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  console.log('Server is up!\n')

  // Full HTML response with headers
  const res = await fetchUrl('/')
  console.log('=== index.html full response ===')
  console.log('Status:', res.status)
  console.log('Headers:', JSON.stringify(res.headers, null, 2))
  console.log('Body:')
  console.log(res.body)

  // Check for the actual script source
  const scriptMatch = res.body.match(/src="([^"]+)"/)
  if (scriptMatch) {
    console.log('\n=== Script source ===')
    console.log(scriptMatch[1])
  }

  child.kill()
  process.exit(0)
}

main()
