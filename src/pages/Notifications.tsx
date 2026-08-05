import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Bell,
  CalendarDays,
  Check,
  CreditCard,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useNotificationStore, type Notification } from '../app/store/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const typeToCategory = (type: Notification['type']): string => {
  switch (type) {
    case 'expense':
    case 'income':
    case 'low_balance':
      return 'finance'
    case 'bill':
      return 'bills'
    case 'transfer':
      return 'transfers'
    case 'savings':
      return 'savings'
    case 'system':
      return 'system'
    default:
      return 'system'
  }
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
}

function NotificationSummary() {
  const { notifications } = useNotificationStore()

  const total = notifications.length
  const unread = notifications.filter((n) => !n.read).length
  const read = notifications.filter((n) => n.read).length
  const highPriority = notifications.filter(
    (n) => n.priority === 'high' && !n.read
  ).length

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-2xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Notification Summary
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Bell size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.div variants={cardVariants} className="flex flex-col gap-2 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total
              </p>
              <p className="text-3xl font-bold text-text">{total}</p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Unread
              </p>
              <p className="text-3xl font-bold text-red-500">{unread}</p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Read
              </p>
              <p className="text-3xl font-bold text-text-secondary">{read}</p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                High Priority
              </p>
              <p className="text-3xl font-bold text-amber-500">{highPriority}</p>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function NotificationCategories({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: string
  setActiveCategory: (category: string) => void
}) {
  const categories = [
    { id: 'all', name: 'All', icon: <Bell size={16} /> },
    { id: 'finance', name: 'Finance', icon: <DollarSign size={16} /> },
    { id: 'bills', name: 'Bills', icon: <CreditCard size={16} /> },
    { id: 'transfers', name: 'Transfers', icon: <TrendingUp size={16} /> },
    { id: 'savings', name: 'Savings', icon: <PiggyBank size={16} /> },
    { id: 'system', name: 'System', icon: <Bell size={16} /> },
  ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            Categories
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <motion.div
            className="flex flex-wrap gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category.id
              return (
                <motion.button
                  key={category.id}
                  variants={cardVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-workspace to-workspace-hover text-white shadow-lg'
                      : 'border border-border bg-secondary text-text-secondary hover:bg-secondary/80'
                  )}
                >
                  {category.icon}
                  {category.name}
                </motion.button>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function NotificationList({
  activeCategory,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
}: {
  activeCategory: string
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAsUnread: (id: string) => void
}) {
  const filtered =
    activeCategory === 'all'
      ? notifications
      : notifications.filter((n) => typeToCategory(n.type) === activeCategory)

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            Notification List
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={48} className="mx-auto mb-4 text-text-tertiary/30" />
              <p className="text-sm text-text-secondary">
                No notifications in this category
              </p>
            </div>
          ) : (
            <motion.div
              className="divide-y divide-border/50"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                },
              }}
            >
              {filtered.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={cardVariants}
                  whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                  className={cn(
                    'relative flex items-start gap-4 p-4 transition-all',
                    !notification.read && 'bg-workspace/5'
                  )}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <span className="text-xl">{notification.icon}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={cn(
                            'font-medium',
                            notification.read ? 'text-text-secondary' : 'text-text'
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Badge
                          variant={
                            notification.priority === 'high'
                              ? 'destructive'
                              : notification.priority === 'medium'
                                ? 'warning'
                                : 'success'
                          }
                          size="sm"
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 rounded-full bg-workspace"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-text-tertiary">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                      <div className="flex items-center gap-2">
                        {notification.read ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onMarkAsUnread(notification.id)}
                            className={cn(
                              'rounded-lg p-1 text-xs text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                            )}
                            title="Mark as unread"
                          >
                            <Bell size={12} />
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onMarkAsRead(notification.id)}
                            className={cn(
                              'rounded-lg p-1 text-xs text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                            )}
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickActions({
  onMarkAllAsRead,
  onClearRead,
  setActiveCategory,
}: {
  onMarkAllAsRead: () => void
  onClearRead: () => void
  setActiveCategory: (category: string) => void
}) {
  const handleFilterUnread = () => {
    setActiveCategory('all')
  }

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            Quick Actions
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.button
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onMarkAllAsRead}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:bg-border'
              )}
            >
              <Check size={16} />
              Mark All as Read
            </motion.button>

            <motion.button
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClearRead}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:bg-border'
              )}
            >
              <Trash2 size={16} />
              Clear Read Notifications
            </motion.button>

            <motion.button
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFilterUnread}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:bg-border'
              )}
            >
              <Bell size={16} />
              Filter Unread
            </motion.button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SmartInsights() {
  const { notifications } = useNotificationStore()

  const unreadCount = notifications.filter((n) => !n.read).length
  const highPriorityCount = notifications.filter(
    (n) => n.priority === 'high' && !n.read
  ).length
  const billsDue = notifications.filter(
    (n) => typeToCategory(n.type) === 'bills' && !n.read
  ).length
  const savingsAchieved = notifications.some(
    (n) => typeToCategory(n.type) === 'savings' && n.read
  )
  const systemNotifications = notifications.filter(
    (n) => typeToCategory(n.type) === 'system' && n.priority === 'high'
  ).length

  const insights = [
    {
      icon: '🔔',
      title: 'Unread Alerts',
      description: `You have ${unreadCount} unread financial alert${unreadCount !== 1 ? 's' : ''}.`,
      type: 'info' as const,
    },
    {
      icon: '💡',
      title: 'Bills Requiring Attention',
      description: `${billsDue} bill${billsDue !== 1 ? 's' : ''} require${billsDue === 1 ? 's' : ''} attention today.`,
      type: highPriorityCount > 0 ? 'warning' as const : 'success' as const,
    },
    {
      icon: '🐷',
      title: 'Savings Achievement',
      description: savingsAchieved
        ? 'A savings goal was reached this week.'
        : 'No savings goals reached this week yet.',
      type: savingsAchieved ? 'success' as const : 'info' as const,
    },
    {
      icon: '✅',
      title: 'System Notifications',
      description: systemNotifications === 0
        ? 'No critical system notifications.'
        : `${systemNotifications} critical system notification${systemNotifications > 1 ? 's' : ''}.`,
      type: systemNotifications === 0 ? 'success' as const : 'warning' as const,
    },
  ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <TrendingUp size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Smart Insights
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-start gap-4 rounded-xl border p-4 transition-all',
                  insight.type === 'success'
                    ? 'border-sri-500/30 bg-sri-500/5'
                    : insight.type === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-border/50 bg-secondary/50'
                )}
              >
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-secondary">
                    {insight.title}
                  </p>
                  <p className="mt-1 text-sm text-text">
                    {insight.description}
                  </p>
                </div>
                <Badge
                  variant={
                    insight.type === 'success'
                      ? 'success'
                      : insight.type === 'warning'
                        ? 'warning'
                        : 'secondary'
                  }
                  size="sm"
                >
                  {insight.type === 'success'
                    ? 'Positive'
                    : insight.type === 'warning'
                      ? 'Attention'
                      : 'Info'}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Notifications() {
  const { currentWorkspace } = useWorkspace()
  const [activeCategory, setActiveCategory] = useState('all')
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearRead,
  } = useNotificationStore()

  const handleMarkAsUnread = (id: string) => {
    useNotificationStore.setState((state: { notifications: Notification[] }) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: false } : n
      ),
    }))
  }

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
      className="flex flex-col gap-8"
    >
      <motion.div
        variants={rowVariants}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
            <Bell size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Notifications
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <CalendarDays size={14} className="text-text-tertiary" />
          <span>{dateLabel}</span>
          <span className="mx-2 text-text-tertiary">·</span>
          <span className="font-medium text-text">
            {currentWorkspace.name} • {currentWorkspace.currency.symbol}
          </span>
        </div>
      </motion.div>

      <NotificationSummary />

      <NotificationCategories
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NotificationList
            activeCategory={activeCategory}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={handleMarkAsUnread}
          />
        </div>
        <div>
          <SmartInsights />
        </div>
      </div>

      <QuickActions
        onMarkAllAsRead={markAllAsRead}
        onClearRead={clearRead}
        setActiveCategory={setActiveCategory}
      />
    </motion.div>
  )
}
