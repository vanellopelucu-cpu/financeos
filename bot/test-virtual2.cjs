const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const projectRoot = 'C:/Users/USER/Desktop/finance_yaya2'
const child = spawn('node', [path.join(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

child.stdout.on('data', () => {})
child.stderr.on('data', () => {})

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
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetchUrl('/')
      if (res.status === 200) break
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  console.log('Server is up!')

  // Check the virtual module
  const vRes = await fetchUrl('/@vite-plugin-pwa/virtual:pwa-register/react')
  console.log('\n=== virtual:pwa-register/react ===')
  console.log('Status:', vRes.status)
  console.log('Body length:', vRes.body?.length || 0)
  console.log('Body:', vRes.body?.substring(0, 500))

  // Check PWAToast module with full body
  const pwaRes = await fetchUrl('/src/components/PWAToast.tsx')
  console.log('\n=== PWAToast.tsx full body ===')
  console.log(pwaRes.body)

  child.kill()
  process.exit(0)
}
main()
