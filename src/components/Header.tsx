import { Bell, Moon, Sun, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useNotificationStore, initializeNotifications } from '../app/store/notifications'
import { NotificationDropdown } from './Header/NotificationDropdown'
import { ProfileMenu } from './Header/ProfileMenu'
import { cn } from '../lib/utils'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { unreadCount } = useNotificationStore()

  useEffect(() => {
    initializeNotifications(currentWorkspace.id)
  }, [currentWorkspace.id])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-border bg-gradient-to-r from-fdf4ff/80 to-f5f3ff/80 px-6 backdrop-blur-md dark:from-surface/80 dark:to-surface/80">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-primary-200/50 hover:text-primary-600'
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
              'relative flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-primary-200/50 hover:text-primary-600'
            )}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className={cn(
                  'absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-white'
                )}
                style={{
                  backgroundColor: '#f9a8d4',
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
              'flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary-400 to-secondary-400 text-white transition-all duration-300 hover:shadow-md'
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
    </header>
  )
}
