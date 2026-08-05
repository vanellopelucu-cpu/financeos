const fs = require('fs')
const path = require('path')
const js = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'sw.js'), 'utf8')

console.log('SW references robots.txt:', js.includes('robots.txt'))

const manifestMatch = js.match(/precache[^"]*"url":"([^"]+)"/g)
if (manifestMatch) {
  console.log('Precached files:')
  manifestMatch.forEach(m => console.log('  ' + m))
} else {
  console.log('No precache manifest found')
}

const errors = js.match(/throw|error|Error/gi)
console.log('Error-related words in SW:', errors ? errors.length : 0)
