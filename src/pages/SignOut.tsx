import { motion, type Variants } from 'framer-motion'
import { LogOut, Shield, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { cn } from '../lib/utils'

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

export function SignOut() {
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspace()
  const { theme } = useTheme()

  const userName = 'Alex Johnson'
  const userEmail = 'alex.johnson@example.com'
  const userAvatar = '👤'

  const handleCancel = () => {
    navigate(-1)
  }

  const handleSignOut = () => {
    localStorage.removeItem('finance-os-theme')
    localStorage.removeItem('finance-os-workspace')
    localStorage.removeItem('finance-os-storage')
    navigate('/login')
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
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md"
      >
        <Card
          glass
          elevated
          className={cn(
            'relative border-0 p-0 shadow-2xl',
            theme === 'dark'
              ? 'bg-gradient-to-br from-surface/60 via-surface/40 to-purple-900/10'
              : 'bg-gradient-to-br from-surface via-surface to-indigo-50/50'
          )}
        >
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl',
                theme === 'dark' ? 'bg-purple-500/15' : 'bg-indigo-300/20'
              )}
            />
            <div
              className={cn(
                'absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl',
                theme === 'dark' ? 'bg-indigo-500/10' : 'bg-purple-200/20'
              )}
            />
            {theme === 'dark' && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/10" />
            )}
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <LogOut size={16} />
                </div>
                <CardTitle className="text-lg font-semibold text-text">
                  Sign Out
                </CardTitle>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                 className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                )}
              >
                <X size={16} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
              className="mb-6 text-center"
            >
              <p className="text-text-secondary">
                Are you sure you want to sign out of FinanceOS?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              className="mb-6 flex flex-col items-center gap-4"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-workspace to-workspace-hover text-4xl text-white shadow-xl">
                {userAvatar}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-text">{userName}</p>
                <p className="text-sm text-text-secondary">{userEmail}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
              className="mb-6 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">
                      Current Workspace
                    </p>
                    <p className="font-semibold text-text">
                      {currentWorkspace.name} • {currentWorkspace.currency.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-tertiary">{dateLabel}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
              className="flex items-center justify-end gap-3 border-t border-border/50 pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-border'
                )}
              >
                <X size={16} />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-red-600 hover:to-red-700'
                )}
              >
                <LogOut size={16} />
                Sign Out
              </motion.button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
