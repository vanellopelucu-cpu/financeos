import { motion, type Variants } from 'framer-motion'
import { Bell, CalendarDays, Moon, Sun, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../../app/providers/ThemeContext'
import { useWorkspace } from '../../app/providers/WorkspaceContext'
import { useNotificationStore } from '../../app/store/notifications'
import { NotificationDropdown } from '../../components/Header/NotificationDropdown'
import { LowBalanceWarning } from './components/LowBalanceWarning'
import { MoneyPockets } from './components/MoneyPockets'
import { RecentTransactions } from './components/RecentTransactions'
import { TodaysTransactions } from './components/TodaysTransactions'
import { HeroBalanceCard } from './components/HeroBalanceCard'
import { UpcomingBillsReminder } from './components/UpcomingBillsReminder'
import { cn } from '../../lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

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
  if (hour >= 5 && hour < 11) return '🌅 Good Morning'
  if (hour >= 11 && hour < 15) return '☀️ Good Afternoon'
  if (hour >= 15 && hour < 18) return '🌤 Good Evening'
  return '🌙 Good Night'
}

export function Dashboard() {
  const { currentWorkspace } = useWorkspace()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotificationStore()
  const isIndonesia = currentWorkspace.id === 'indonesia'
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = getGreeting(hour)

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 pt-2"
    >
      {/* Page Header */}
      <motion.div
        variants={rowVariants}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <motion.h1
            className="text-3xl font-bold tracking-tight text-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {greeting}, Yaya 🌸
          </motion.h1>

          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-sm text-text-secondary italic"
          >
            "{QUOTES[quoteIndex]}"
          </motion.div>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CalendarDays size={14} className="text-text-tertiary" />
            <span>{dateLabel}</span>
            <span className="mx-2 text-text-tertiary">·</span>
            <span className="font-medium text-text">
              {currentWorkspace.name} • {currentWorkspace.currency.symbol}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-200 hover:bg-border hover:text-text'
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
                'relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-200 hover:bg-border hover:text-text'
              )}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-white'
                  )}
                  style={{
                    backgroundColor: '#ef4444',
                  }}
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
              onClick={() => setShowProfile(!showProfile)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-purple-500 to-indigo-600 text-white transition-all duration-200 hover:shadow-md'
              )}
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Low Balance Warning - appears automatically when below threshold */}
      <LowBalanceWarning />

      {/* Top Row: Hero Balance Card (left) + Upcoming Bills (right) */}
      <motion.div
        variants={rowVariants}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <HeroBalanceCard />
        </div>
        <div>
          <UpcomingBillsReminder />
        </div>
      </motion.div>

      {/* Second Row: Workspace dependent */}
      <motion.div variants={rowVariants}>
        {isIndonesia ? <MoneyPockets /> : <TodaysTransactions />}
      </motion.div>

      {/* Third Row: Recent Transactions Table */}
      <motion.div variants={rowVariants}>
        <RecentTransactions />
      </motion.div>
    </motion.div>
  )
}
