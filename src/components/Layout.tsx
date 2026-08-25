import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, Moon, Sun, User, Plus, LayoutDashboard, ArrowLeftRight, Wallet, MoreHorizontal } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { MobileSidebar } from '../components/MobileSidebar'
import { Header } from '../components/Header'
import { NotificationDropdown } from '../components/Header/NotificationDropdown'
import { ProfileMenu } from '../components/Header/ProfileMenu'
import { AddTransactionModal } from './AddTransactionModal'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useNotificationStore } from '../app/store/notifications'
import { useDashboardStore } from '../app/store'
import { cn } from '../lib/utils'

const QUOTES = [
  'Small savings today create big opportunities tomorrow.',
  'Every expense should bring value to your life.',
  'Financial freedom starts with good habits.',
  'Consistency beats intensity in managing money.',
  'Your future self will thank you for today\'s discipline.',
  'Spend wisely, save confidently.',
  'Money grows where attention goes.',
  'A budget is a plan for your dreams.',
  'Every transaction tells a story.',
  'Healthy finances create a peaceful mind.',
  'Discipline today, freedom tomorrow.',
  'Little by little, wealth grows.',
  'Track your money before your money tracks you.',
  'Progress is better than perfection.',
  'Smart spending creates a stronger future.',
  'Budgeting is telling your money where to go instead of wondering where it went.',
  'Wealth is the reward, for living as if your resources are limited.',
]

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 11) return 'Good Morning'
  if (hour >= 11 && hour < 15) return 'Good Afternoon'
  if (hour >= 15 && hour < 18) return 'Good Evening'
  return 'Good Night'
}

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCurrencySelector, setShowCurrencySelector] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { currentWorkspace, setWorkspace } = useWorkspace()
  const { unreadCount } = useNotificationStore()
  const { addTransaction, fetchTransactions, fetchAnalytics } = useDashboardStore()
  const isDark = theme === 'dark'
  const location = useLocation()
  const navigate = useNavigate()
  const [quoteIndex, setQuoteIndex] = useState(() => new Date().getSeconds() % QUOTES.length)

  const now = new Date()
  const hour = now.getHours()
  const greeting = getGreeting(hour)
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log('Layout rendered, theme:', theme)
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { path: '/budgets', icon: Wallet, label: 'Budgets' },
    { path: '/settings', icon: MoreHorizontal, label: 'More' },
  ]

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-clip bg-background">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        {location.pathname === '/' && !mobileNavOpen && (
          <div className="hidden md:block">
            <div className="fixed top-0 right-0 left-0 z-50 md:left-64">
              <Header />
            </div>
          </div>
        )}

        {location.pathname === '/' && !mobileNavOpen && (
          <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/80 backdrop-blur-md md:hidden">
            <div className="flex h-12 items-center justify-between gap-2 px-4">
              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setMobileNavOpen(true)}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-border'
                )}
              >
                <Menu size={20} />
              </button>
              <span className="min-w-0 flex-1 truncate text-center text-lg font-bold text-text">FinanceOS</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-border'
                  )}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-border'
                    )}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-white dark:bg-red-600" style={isDark ? {} : { backgroundColor: '#ef4444' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    aria-label="User menu"
                    onClick={() => setShowProfile(!showProfile)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-gradient-to-br from-purple-500 to-indigo-600 text-white transition-all duration-300 hover:shadow-md'
                    )}
                  >
                    <User size={18} />
                  </button>
                  {showProfile && (
                    <ProfileMenu isOpen={showProfile} onClose={() => setShowProfile(false)} />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 px-4 pb-3">
              <h1 className="text-base font-semibold text-text">
                {greeting}, Yaya 🌸
              </h1>
              <p className="text-xs italic text-text-secondary">
                &ldquo;{QUOTES[quoteIndex]}&rdquo;
              </p>
              <p className="text-xs text-text-tertiary">
                {dateLabel} · {currentWorkspace.name} · {currentWorkspace.currency.symbol}
              </p>
            </div>
          </header>
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 sm:px-6 md:pb-12 lg:px-8">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
          {/* Currency Selector Popup */}
          {showCurrencySelector && (
            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2">
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setWorkspace('indonesia')
                    setShowCurrencySelector(false)
                  }}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                    currentWorkspace.id === 'indonesia'
                      ? 'bg-workspace text-white'
                      : 'text-text-secondary hover:bg-secondary'
                  )}
                >
                  IDR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkspace('srilanka')
                    setShowCurrencySelector(false)
                  }}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                    currentWorkspace.id === 'srilanka'
                      ? 'bg-workspace text-white'
                      : 'text-text-secondary hover:bg-secondary'
                  )}
                >
                  LKR
                </button>
              </div>
              {/* Arrow pointing down to Dashboard button */}
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-background" />
            </div>
          )}

          <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
            {navItems.slice(0, 2).map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setShowCurrencySelector(false)
                  if (item.path === '/') {
                    if (location.pathname === '/') {
                      setShowCurrencySelector((prev) => !prev)
                    } else {
                      navigate('/')
                      window.scrollTo({ top: 0, behavior: 'instant' })
                    }
                  } else {
                    navigate(item.path)
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                  isActive(item.path)
                    ? 'text-workspace'
                    : 'text-text-secondary hover:text-text'
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCurrencySelector(false)
                setShowAddTransaction(true)
              }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
            >
              <Plus size={28} />
            </button>
            {navItems.slice(2).map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setShowCurrencySelector(false)
                  navigate(item.path)
                }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                  isActive(item.path)
                    ? 'text-workspace'
                    : 'text-text-secondary hover:text-text'
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        {/* Invisible overlay to close popup when clicking outside */}
        {showCurrencySelector && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCurrencySelector(false)}
          />
        )}
        <AddTransactionModal
          open={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onSave={async (transaction) => {
            const result = await addTransaction(transaction)
            if (result.success) {
              setShowAddTransaction(false)
              await fetchTransactions()
              await fetchAnalytics()
            }
          }}
        />
      </div>
    </div>
  )
}
