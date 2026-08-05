import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'

export function LowBalanceWarning() {
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
      className="w-full"
    >
      <Card className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/30">
        <div className="flex items-start gap-4 p-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600"
          >
            <AlertTriangle size={20} />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300">
              Low Balance
            </h3>
            <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-400/80">
              Your balance is below the recommended minimum.
            </p>
            <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-400/80">
              Avoid non-essential spending.
            </p>
            <p className="mt-3 text-2xl font-bold text-amber-900 dark:text-amber-300">
              {formatCurrencyFull(balance.availableBalance, currency.code)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex-shrink-0 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-800 dark:text-amber-300 transition-colors hover:bg-amber-500/30'
            )}
          >
            <TrendingUp size={16} className="mr-1.5 inline" />
            Save More
          </motion.button>
        </div>
      </Card>
    </motion.div>
  )
}
