const fs = require('fs')
const path = require('path')
const vm = require('vm')

// Load the production bundle
const bundlePath = path.resolve(__dirname, '../dist/assets/index-b2K6Ancs.js')
const bundle = fs.readFileSync(bundlePath, 'utf8')

// Create a minimal browser-like environment
const sandbox = {
  console: console,
  window: {
    location: { href: 'http://localhost:5173/', origin: 'http://localhost:5173' },
    navigator: { userAgent: 'Mozilla/5.0', onLine: true },
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    localStorage: {
      _data: {},
      getItem: function(k) { return this._data[k] || null },
      setItem: function(k, v) { this._data[k] = v },
      removeItem: function(k) { delete this._data[k] },
      clear: function() { this._data = {} },
    },
  },
  document: {
    getElementById: () => ({ appendChild: () => {}, remove: () => {} }),
    createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
    addEventListener: () => {},
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
  },
  navigator: { userAgent: 'Mozilla/5.0', onLine: true },
  localStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null },
    setItem: function(k, v) { this._data[k] = v },
    removeItem: function(k) { delete this._data[k] },
    clear: function() { this._data = {} },
  },
  navigator: { onLine: true },
  self: {},
  import.meta: { env: { MODE: 'production' } },
}

sandbox.globalThis = sandbox
sandbox.window = sandbox.window
sandbox.document = sandbox.document
sandbox.window.document = sandbox.document

vm.createContext(sandbox)

try {
  // Try to evaluate the bundle
  vm.runInContext(bundle, sandbox, { timeout: 10000 })
  console.log('Bundle executed successfully')
  console.log('window keys:', Object.keys(sandbox.window).filter(k => !['localStorage','addEventListener','removeEventListener','matchMedia','location','navigator','innerWidth','innerHeight'].includes(k)))
} catch(e) {
  console.log('Execution error:', e.message)
  // Print the error with context
  if (e.stack) {
    console.log('Stack:', e.stack.split('\n').slice(0, 5).join('\n'))
  }
}

// Also check the index.html
const htmlPath = path.resolve(__dirname, '../dist/index.html')
const html = fs.readFileSync(htmlPath, 'utf8')
console.log('\n=== index.html ===')
console.log(html)
