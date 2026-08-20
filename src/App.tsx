import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './app/providers/ThemeContext'
import { WorkspaceProvider } from './app/providers/WorkspaceContext'
import { AuthProvider } from './app/providers/AuthContext'
import { PWAToast } from './components/PWAToast'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { Analytics } from './pages/Analytics'
import { Accounts } from './pages/Accounts'
import { Settings } from './pages/Settings'
import { Notifications } from './pages/Notifications'
import { DebtsAndCredits } from './pages/DebtsAndCredits'
import { Bills } from './pages/Bills'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { RequireAuth } from './app/providers/AuthContext'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/debts-credits" element={<DebtsAndCredits />} />
              </Route>
            </Routes>
            <PWAToast />
          </BrowserRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
