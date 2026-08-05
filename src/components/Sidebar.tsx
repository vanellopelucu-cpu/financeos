import {
  BarChart3,
  Bell,
  CreditCard,
  Home,
  LogOut,
  PieChart,
  Settings,
  Wallet,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <Home size={20} /> },
  { label: 'Transactions', href: '/transactions', icon: <CreditCard size={20} /> },
  { label: 'Budgets', href: '/budgets', icon: <PieChart size={20} /> },
  { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={20} /> },
  { label: 'Accounts', href: '/accounts', icon: <Wallet size={20} /> },
  { label: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-y-7 overflow-y-auto border-r border-border bg-surface p-4 shadow-soft dark:shadow-soft-dark md:flex">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 text-white shadow-md">
            <span className="text-lg font-bold">💎</span>
          </div>
          <span className="text-xl font-bold text-text">FinanceOS</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-r from-primary-200/30 to-secondary-200/30 text-primary-700 border-l-2 border-primary-500'
                  : 'text-text-secondary hover:bg-primary-200/30 hover:text-primary-700'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-text-tertiary group-hover:text-primary-600'
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border px-2 pt-4">
        <WorkspaceSwitcher />
        <Link
          to="/settings"
          className={cn(
            'mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:bg-primary-200/30 hover:text-primary-700'
          )}
        >
          <Settings size={20} />
          Settings
        </Link>
        <button
          type="button"
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-error-500 transition-all duration-300 hover:bg-error-100/50'
          )}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
