const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

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
  
  // Fetch HTML and print exact content with hex
  const res = await fetchUrl('/')
  const body = res.body || ''
  
  console.log('=== Exact HTML content ===')
  console.log(body)
  console.log('\n=== HTML byte length:', Buffer.byteLength(body, 'utf8'), '===')
  
  // Check for any <script> tags in body
  const scriptMatches = body.match(/<script[^>]*>.*<\/script>/g) || []
  console.log('\nScript tags in HTML:')
  scriptMatches.forEach((s, i) => console.log('  [' + i + ']:', s.substring(0, 100)))
  
  // Check for any injected content
  const injected = body.includes('vite-plugin-pwa')
  console.log('\nContains vite-plugin-pwa reference:', injected)
  
  // Check for service worker registration
  const swReg = body.includes('serviceWorker') || body.includes('navigator.serviceWorker')
  console.log('Contains serviceWorker reference:', swReg)

  child.kill()
  process.exit(0)
}

main()
