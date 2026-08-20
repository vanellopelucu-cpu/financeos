import { motion, type Variants } from 'framer-motion'
import { Bell, Check, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../app/providers/WorkspaceContext'
import { useNotificationStore } from '../../app/store/notifications'
import { Badge } from '../../components/ui/Badge'
import { cn, formatCurrencyFull } from '../../lib/utils'

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
  } = useNotificationStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleViewAll = () => {
    onClose()
    navigate('/notifications')
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)

    if (diffHours > 0) {
      return `${diffHours}h ago`
    }
    return `${diffMinutes}m ago`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <TrendingDown size={16} className="text-red-500" />
      case 'income':
        return <TrendingUp size={16} className="text-sri-500" />
      case 'bill':
        return <Bell size={16} className="text-amber-500" />
      case 'transfer':
        return <Bell size={16} className="text-indo-500" />
      case 'savings':
        return <Bell size={16} className="text-sri-500" />
      case 'low_balance':
        return <Bell size={16} className="text-red-500" />
      default:
        return <Bell size={16} className="text-text-tertiary" />
    }
  }

  return (
    <motion.div
      ref={dropdownRef}
      variants={dropdownVariants}
      initial="hidden"
      animate={isOpen ? 'visible' : 'exit'}
      className={cn(
        'absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[20px] border border-border/50 shadow-xl',
        'z-[9999]',
        'bg-white/94 dark:bg-[#1a1a1f]/94 backdrop-blur-xl',
        'glass'
      )}
    >
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Notifications</h3>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Badge variant="destructive" size="sm">
                {unreadCount} unread
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell size={48} className="mx-auto mb-3 text-text-tertiary/30" />
            <p className="text-sm text-text-secondary">
              No notifications yet
            </p>
          </div>
        ) : (
          <motion.div
            className="divide-y divide-border/50"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.05, delayChildren: 0.1 },
              },
            }}
          >
            {notifications.slice(0, 8).map((notification) => (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cn(
                  'relative flex items-start gap-3 p-4 transition-all hover:bg-primary-200/30 dark:hover:bg-secondary/50',
                  !notification.read && 'bg-primary-300/10'
                )}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                  {getNotificationIcon(notification.type)}
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
                      {notification.amount !== undefined && (
                        <p
                          className={cn(
                            'mt-1 text-sm font-medium',
                            notification.type === 'income'
                              ? 'text-sri-500'
                              : notification.type === 'expense'
                                ? 'text-red-500'
                                : 'text-text'
                          )}
                        >
                          {notification.type === 'income' ? '+' : notification.type === 'expense' ? '-' : ''}
                          {formatCurrencyFull(
                            Math.abs(notification.amount),
                            notification.currencyCode || currency.code
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <span className="text-xs text-text-tertiary">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="h-2 w-2 rounded-full bg-primary-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {!notification.read && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMarkAsRead(notification.id)}
                     className={cn(
                      'absolute right-2 top-2 rounded-lg p-1.5 text-text-tertiary transition-all hover:bg-border hover:text-text'
                    )}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-border/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllAsRead}
                 className={cn(
                  'flex items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:bg-primary-200/50 hover:text-primary-600 dark:hover:bg-secondary/50 dark:hover:text-text-secondary sm:py-1.5'
                )}
              >
                <Check size={12} />
                Mark all as read
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAll}
                 className={cn(
                  'flex items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-primary-600 transition-all hover:text-primary-700 dark:text-text-secondary dark:hover:text-text sm:py-1.5'
                )}
              >
                View all
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
