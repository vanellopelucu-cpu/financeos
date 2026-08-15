import { motion, type Variants } from 'framer-motion'
import { LogOut, Mail, Settings, User } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleNavigate = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <motion.div
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute top-12 right-0 z-50 w-48 rounded-xl border border-border bg-surface shadow-lg"
      >
        <div className="p-2">
          <div className="border-b border-border/50 px-3 py-2">
            <p className="text-xs text-text-tertiary">Signed in as</p>
            <p className="text-sm font-medium text-text truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>

          <motion.button
            whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
            onClick={() => handleNavigate('/settings')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:text-text'
            )}
          >
            <User size={16} />
            Profile
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
            onClick={() => handleNavigate('/settings')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:text-text'
            )}
          >
            <Settings size={16} />
            Settings
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
            onClick={() => handleNavigate('/settings')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:text-text'
            )}
          >
            <Mail size={16} />
            <span>{user?.email || 'user@example.com'}</span>
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
            onClick={() => handleNavigate('/settings')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:text-text'
            )}
          >
            <User size={16} />
            <span>{user?.user_metadata?.display_name || 'Set Display Name'}</span>
          </motion.button>

          <div className="border-t border-border/50 my-1"></div>

          <motion.button
            whileHover={{ backgroundColor: 'hsl(var(--error-500) / 0.1)' }}
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-error-500 hover:text-error-600'
            )}
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
