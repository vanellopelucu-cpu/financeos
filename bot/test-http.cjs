const http = require('http')

function testUrl(path, label) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${path}`, (res) => {
      let body = ''
      res.on('data', (c) => body += c)
      res.on('end', () => {
        const hasError = body.toLowerCase().includes('error') || body.includes('Cannot find') || body.includes('Failed to')
        console.log(`[${label}] Status: ${res.statusCode}, Body: ${body.length} bytes, Has error: ${hasError}`)
        if (body.length < 500) console.log(`  Preview: ${body.substring(0, 500)}`)
        resolve()
      })
    }).on('error', (e) => {
      console.log(`[${label}] Error: ${e.message}`)
      resolve()
    })
  })
}

;(async () => {
  await testUrl('/', 'index.html')
  await testUrl('/src/main.tsx', 'main.tsx')
  await testUrl('/src/App.tsx', 'App.tsx')
})()
