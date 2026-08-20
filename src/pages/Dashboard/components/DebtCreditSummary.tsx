import { motion, type Variants } from 'framer-motion'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function DebtCreditSummary() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { debts = [], credits = [] } = useDashboardStore()

  const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalCredit = credits.reduce((sum, c) => sum + c.remainingAmount, 0)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card
        glass
        elevated
        className="border-0 shadow-xl"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Hutang & Piutang
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
          >
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <TrendingDown size={20} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Total Hutang
                </p>
                <p className="text-xl font-bold text-red-500">
                  {formatCurrencyFull(totalDebt, currency.code)}
                </p>
              </div>
              <span className="text-xs text-text-tertiary">
                {debts.length} hutang
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <TrendingUp size={20} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Total Piutang
                </p>
                <p className="text-xl font-bold text-green-500">
                  {formatCurrencyFull(totalCredit, currency.code)}
                </p>
              </div>
              <span className="text-xs text-text-tertiary">
                {credits.length} piutang
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
                <Wallet size={20} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Net Position
                </p>
                <p
                  className={cn(
                    'text-xl font-bold',
                    totalCredit - totalDebt >= 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {totalCredit - totalDebt >= 0 ? '+' : ''}
                  {formatCurrencyFull(totalCredit - totalDebt, currency.code)}
                </p>
              </div>
              <span className="text-xs text-text-tertiary">
                Credit - Debt
              </span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

