import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, X } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card } from '../../../components/ui/Card'
import { formatCurrencyFull } from '../../../lib/utils'

interface LowBalanceWarningProps {
  onDismiss: () => void
}

export function LowBalanceWarning({ onDismiss }: LowBalanceWarningProps) {
  const { currentWorkspace } = useWorkspace()
  const { balance } = useDashboardStore()
  const { currency, warningThreshold } = currentWorkspace

  const showWarning = balance.availableBalance < warningThreshold

  if (!showWarning) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -20 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full min-w-0"
    >
      <Card className="overflow-hidden border-amber-200/50 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/30">
        <div className="relative flex flex-col gap-3 p-3 pr-8 sm:flex-row sm:items-start sm:gap-4 sm:p-4 sm:pr-12 md:p-6 md:pr-14">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/10 sm:top-3 sm:right-3 sm:h-7 sm:w-7 md:top-4 md:right-4"
            aria-label="Dismiss warning"
          >
            <X size={16} />
          </button>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 sm:h-10 sm:w-10"
          >
            <AlertTriangle size={18} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 sm:text-base md:text-lg">
              Low Balance
            </h3>
            <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-400/80 sm:mt-1 sm:text-sm">
              Your balance is below the recommended minimum. Avoid non-essential spending.
            </p>
            <p className="mt-2 text-xl font-bold text-amber-900 dark:text-amber-300 sm:mt-3 sm:text-2xl md:text-3xl">
              {formatCurrencyFull(balance.availableBalance, currency.code)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex shrink-0 items-center justify-center gap-1 self-start rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-500/30 dark:text-amber-300 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
          >
            <TrendingUp size={14} />
            <span>Save More</span>
          </motion.button>
        </div>
      </Card>
    </motion.div>
  )
}

