const { spawn } = require('child_process')
const http = require('http')
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
  console.log('Server is up!\n')

  const virtualModules = [
    '/@vite-plugin-pwa/virtual:pwa-register/react',
    '/@vite-plugin-pwa/dev-sw.js',
    '/@vite-plugin-pwa/register-dev-sw.js',
  ]

  for (const mod of virtualModules) {
    const result = await fetchUrl(mod)
    console.log(`${mod}: status=${result.status}, bytes=${result.body?.length || 0}`)
    if (result.status === 200 && result.body) {
      console.log('  Preview:', result.body.substring(0, 200))
    }
  }

  child.kill()
  process.exit(0)
}

main()
