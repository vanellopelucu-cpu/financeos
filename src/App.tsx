import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './app/providers/ThemeContext'
import { WorkspaceProvider } from './app/providers/WorkspaceContext'
import { PWAToast } from './components/PWAToast'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { Analytics } from './pages/Analytics'
import { Accounts } from './pages/Accounts'
import { Settings } from './pages/Settings'
import { Notifications } from './pages/Notifications'

export function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Routes>
          <PWAToast />
        </BrowserRouter>
      </WorkspaceProvider>
    </ThemeProvider>
  )
}
