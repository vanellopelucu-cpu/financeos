import { motion } from 'framer-motion'
import { Clock, TrendingDown, TrendingUp } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull, getCategoryIcon } from '../../../lib/utils'

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export function TodaysTransactions() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions } = useDashboardStore()

  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter((t) => t.date === today)

  const totalSpent = todayTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalReceived = todayTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      <Card glass elevated className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Today's Transactions
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Clock size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {todayTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-text-secondary">
                No transactions for today
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-sri-500" />
                  <span className="text-sm text-text-secondary">
                    Received:{' '}
                    <span className="font-semibold text-sri-500">
                      {formatCurrencyFull(totalReceived, currency.code)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-sm text-text-secondary">
                    Spent:{' '}
                    <span className="font-semibold text-red-500">
                      {formatCurrencyFull(Math.abs(totalSpent), currency.code)}
                    </span>
                  </span>
                </div>
              </div>

              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.1,
                    },
                  },
                }}
              >
                {todayTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    variants={itemVariants}
                    whileHover={{
                      backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)',
                      x: 4,
                    }}
                     className={cn(
                       'flex items-center gap-3 rounded-xl p-3 transition-all sm:gap-4'
                     )}
                   >
                     <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-lg sm:h-10 sm:w-10 sm:text-xl">
                       {tx.icon || getCategoryIcon(tx.category)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-text text-sm sm:text-base truncate">{tx.description}</p>
                       <p className="text-xs text-text-secondary">
                         {tx.category}
                       </p>
                     </div>
                     <div className="text-right flex-shrink-0">
                       <p
                         className={cn(
                           'font-semibold text-sm sm:text-base',
                           tx.amount >= 0 ? 'text-workspace' : 'text-red-500'
                         )}
                       >
                         {tx.amount >= 0 ? '+' : '-'}
                         {formatCurrencyFull(Math.abs(tx.amount), currency.code)}
                       </p>
                       <p className="text-xs text-text-tertiary hidden sm:block">{tx.date}</p>
                     </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

