import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Bell, Menu, Moon, Sun, User } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { MobileSidebar } from '../components/MobileSidebar'
import { NotificationDropdown } from '../components/Header/NotificationDropdown'
import { ProfileMenu } from '../components/Header/ProfileMenu'
import { useTheme } from '../app/providers/ThemeContext'
import { useNotificationStore } from '../app/store/notifications'
import { cn } from '../lib/utils'

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotificationStore()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen(true)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-border'
              )}
            >
              <Menu size={20} />
            </button>
            <span className="text-lg font-bold text-text">FinanceOS</span>
          </div>
          <div className="flex items-center gap-1">
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
                  <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-white" style={{ backgroundColor: '#ef4444' }}>
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
        </header>
        <main className="p-4 sm:p-6 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
