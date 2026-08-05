const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.resolve(__dirname, '../vite.config.ts'), 'utf8')

console.log('Has BOM:', content.charCodeAt(0) === 0xFEFF)
const hasCRLF = content.includes('\r\n')
console.log('Line endings: CRLF=' + hasCRLF + ', LF=' + !hasCRLF)
console.log('Total lines:', content.split('\n').length)
console.log('Starts with import:', content.startsWith('import { defineConfig }'))
console.log('Ends with })', content.trimEnd().endsWith('})'))
console.log('Content length:', content.length)

// Check for trailing whitespace
const lines = content.split('\n')
let twCount = 0
for (let i = 0; i < lines.length; i++) {
  if (lines[i] !== lines[i].trimEnd()) {
    twCount++
  }
}
console.log('Lines with trailing whitespace:', twCount)

// Check exact content of the VitePWA block
const pwaStart = content.indexOf('VitePWA({')
const pwaEnd = content.lastIndexOf('})')
if (pwaStart !== -1 && pwaEnd !== -1) {
  console.log('\nVitePWA config present: true')
  console.log('includeAssets present:', content.includes("includeAssets: ['favicon.svg', 'robots.txt']"))
  console.log('registerType present:', content.includes("registerType: 'prompt'"))
  console.log('injectRegister present:', content.includes("injectRegister: false"))
}
