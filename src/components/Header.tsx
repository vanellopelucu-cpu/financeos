import { Bell, Moon, Plus, Sun, User } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { useNotificationStore, initializeNotifications } from '../app/store/notifications'
import { AddTransactionModal } from './AddTransactionModal'
import { NotificationDropdown } from './Header/NotificationDropdown'
import { ProfileMenu } from './Header/ProfileMenu'
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

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const { unreadCount } = useNotificationStore()
  const [quoteIndex, setQuoteIndex] = useState(() => new Date().getSeconds() % QUOTES.length)
  const { addTransaction, fetchTransactions, fetchAnalytics } = useDashboardStore()

  const now = new Date()
  const hour = now.getHours()
  const greeting = getGreeting(hour)
  const isDark = theme === 'dark'
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

  const toggleProfile = useCallback(() => {
    setShowProfile((prev) => !prev)
  }, [])

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev)
  }, [])

  useEffect(() => {
    initializeNotifications(currentWorkspace.id)
  }, [currentWorkspace.id])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-gradient-to-r from-fdf4ff/80 to-f5f3ff/80 backdrop-blur-md dark:from-surface/80 dark:to-surface/80">
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-7 md:py-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-text sm:text-2xl">
            {greeting}, Yaya 🌸
          </h1>
          <p className="mt-1 text-xs italic text-text-secondary sm:text-sm">
            &ldquo;{QUOTES[quoteIndex]}&rdquo;
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {dateLabel} · {currentWorkspace.name} · {currentWorkspace.currency.symbol}
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            aria-label="Tambah Transaksi"
            onClick={() => setShowAddTransaction(true)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-primary-200/50 hover:text-primary-600 dark:hover:bg-secondary/50 dark:hover:text-text-secondary'
            )}
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-primary-200/50 hover:text-primary-600 dark:hover:bg-secondary/50 dark:hover:text-text-secondary'
            )}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={toggleNotifications}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-primary-200/50 hover:text-primary-600 dark:hover:bg-secondary/50 dark:hover:text-text-secondary'
              )}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface text-[9px] font-bold text-white dark:bg-pink-600"
                  style={isDark ? {} : { backgroundColor: '#f9a8d4' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="User menu"
              onClick={toggleProfile}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-gradient-to-br from-primary-400 to-secondary-400 text-white transition-all duration-300 hover:shadow-md'
              )}
            >
              <User size={18} />
            </button>
            {showProfile && (
              <ProfileMenu
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
              />
            )}
          </div>
        </div>
      </div>
      {showAddTransaction &&
        createPortal(
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
          />,
          document.body
        )}
    </header>
  )
}
