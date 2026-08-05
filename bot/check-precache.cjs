const fs = require('fs')
const path = require('path')
const sw = fs.readFileSync(path.resolve(__dirname, '../dist/sw.js'), 'utf8')

// Check if robots.txt is in the precache
console.log('robots.txt in SW:', sw.includes('robots.txt'))

// Find all precached URLs
const urls = sw.match(/"url":"[^"]+"/g) || []
console.log('\nPrecached URLs:')
urls.forEach(u => console.log('  ' + u))

// Find the precache manifest section
const precacheIdx = sw.indexOf('precache')
if (precacheIdx !== -1) {
  console.log('\nPrecache section:')
  console.log(sw.substring(precycleIdx, precacheIdx + 500))
}
