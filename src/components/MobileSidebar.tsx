import { motion, type Variants } from 'framer-motion'
import {
  BarChart3,
  Bell,
  CreditCard,
  Home,
  LogOut,
  PieChart,
  Settings,
  Wallet,
  X,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthContext'
import { cn } from '../lib/utils'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <Home size={20} /> },
  { label: 'Transactions', href: '/transactions', icon: <CreditCard size={20} /> },
  { label: 'Budgets', href: '/budgets', icon: <PieChart size={20} /> },
  { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={20} /> },
  { label: 'Accounts', href: '/accounts', icon: <Wallet size={20} /> },
  { label: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
  { label: 'Bills', href: '/bills', icon: <CreditCard size={20} /> },
]

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

const sidebarVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { x: '-100%', transition: { duration: 0.2, ease: 'easeIn' } },
}

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!open) return null

  return (
    <>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-y-0 left-0 z-50 w-64 flex-col gap-y-7 overflow-y-auto border-r border-border bg-surface p-4 shadow-xl"
      >
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 text-white shadow-md">
              <span className="text-lg font-bold">💎</span>
            </div>
            <span className="text-xl font-bold text-text">FinanceOS</span>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-secondary'
            )}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={onClose}
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
            onClick={onClose}
            className={cn(
              'mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:bg-primary-200/30 hover:text-primary-700'
            )}
          >
            <Settings size={20} />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              'mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-error-500 transition-all duration-300 hover:bg-error-100/50'
            )}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  )
}
