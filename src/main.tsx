import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

console.log('APP STARTED')

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('ROOT:', document.getElementById('app'))
