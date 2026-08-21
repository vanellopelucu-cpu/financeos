import { motion, type Variants } from 'framer-motion'
import { ChevronRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalCredit = credits.reduce((sum, c) => sum + c.remainingAmount, 0)

  const unpaidDebts = debts.filter((d) => d.status !== 'paid')
  const unreceivedCredits = credits.filter((c) => c.status !== 'received')

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Wallet size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-border/50 bg-secondary/30 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <TrendingDown size={14} />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Hutang
                </span>
              </div>
              <p className="text-xl font-bold text-red-500">
                {formatCurrencyFull(totalDebt, currency.code)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {unpaidDebts.length} belum lunas
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-border/50 bg-secondary/30 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <TrendingUp size={14} />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Piutang
                </span>
              </div>
              <p className="text-xl font-bold text-green-500">
                {formatCurrencyFull(totalCredit, currency.code)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {unreceivedCredits.length} belum diterima
              </p>
            </motion.div>
          </div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/debts-and-credits')}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700'
            )}
          >
            Lihat Semua
            <ChevronRight size={16} />
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
