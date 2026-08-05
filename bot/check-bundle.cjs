const fs = require('fs')
const path = require('path')
const js = fs.readFileSync(path.resolve(__dirname, '../dist/assets/index-b2K6Ancs.js'), 'utf8')

const createClientIdx = js.indexOf('createClient')
console.log('createClient found:', createClientIdx !== -1)

const placeholderIdx = js.indexOf('placeholder.supabase.co')
console.log('Placeholder URL found:', placeholderIdx !== -1)

if (createClientIdx !== -1) {
  console.log('\n=== createClient context ===')
  console.log(js.substring(Math.max(0, createClientIdx - 100), createClientIdx + 200))
}

const configIdx = js.indexOf('isSupabaseConfigured')
console.log('isSupabaseConfigured found:', configIdx !== -1)

const viteSupabaseIdx = js.indexOf('VITE_SUPABASE')
console.log('VITE_SUPABASE found:', viteSupabaseIdx !== -1)

// Check what the supabase client initialization looks like
const supabaseInitIdx = js.indexOf('https://placeholder')
if (supabaseInitIdx !== -1) {
  console.log('\n=== Supabase init context ===')
  console.log(js.substring(Math.max(0, supabaseInitIdx - 50), supabaseInitIdx + 100))
}
