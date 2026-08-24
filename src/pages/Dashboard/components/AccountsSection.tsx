import { motion } from 'framer-motion'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { cn, formatCurrencyFull } from '../../../lib/utils'

export function AccountsSection() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { accounts } = useDashboardStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-text-secondary">
          Akun
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              'flex-shrink-0 w-36 sm:w-40 rounded-xl border border-border/50 bg-secondary/30 p-3',
              'hover:bg-secondary/50 transition-colors cursor-pointer'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{account.icon}</span>
              <span className="text-sm font-medium text-text truncate">{account.name}</span>
            </div>
            <p className={cn(
              'text-sm font-semibold truncate',
              account.balance >= 0 ? 'text-text' : 'text-red-500'
            )}>
              {formatCurrencyFull(account.balance, currency.code)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
