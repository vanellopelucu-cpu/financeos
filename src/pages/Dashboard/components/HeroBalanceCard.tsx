import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { HealthBadge } from '../../../components/ui/Badge'
import { cn, formatCurrencyFull } from '../../../lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function HeroBalanceCard() {
  const { theme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const { balance } = useDashboardStore()
  const { currency } = currentWorkspace

  const net = balance.income - balance.expenses

  const financialHealth = (): 'excellent' | 'good' | 'fair' | 'needs-attention' => {
    const ratio = balance.income > 0 ? balance.expenses / balance.income : 1
    if (ratio <= 0.3) return 'excellent'
    if (ratio <= 0.5) return 'good'
    if (ratio <= 0.7) return 'fair'
    return 'needs-attention'
  }

  const isDark = theme === 'dark'

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="h-full"
    >
      <Card
        glass
        elevated
        className={cn(
          'relative h-full overflow-hidden border-0 p-0 shadow-2xl',
          isDark
            ? 'bg-gradient-to-br from-surface/60 via-surface/40 to-purple-900/10'
            : 'bg-gradient-to-br from-surface via-surface to-indigo-50/50'
        )}
      >
        <div className="absolute inset-0 -z-10">
          <div
            className={cn(
              'absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl',
              isDark ? 'bg-purple-500/15' : 'bg-indigo-300/20'
            )}
          />
          <div
            className={cn(
              'absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl',
              isDark ? 'bg-indigo-500/10' : 'bg-purple-200/20'
            )}
          />
          {isDark && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/10" />
          )}
        </div>

        <CardHeader className="relative border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Available Balance
            </CardTitle>
            <HealthBadge
              health={financialHealth()}
              workspace={currentWorkspace.theme === 'green'}
            />
          </div>
            <motion.p
              variants={fadeInUp}
              className="text-3xl font-black tracking-tight text-text md:text-6xl"
            >
             {formatCurrencyFull(balance.availableBalance, currency.code)}
           </motion.p>
           <motion.p
              variants={fadeInUp}
              className="mt-1 text-sm text-text-secondary"
            >
              Available to Spend: {formatCurrencyFull(balance.safeSpending, currency.code)}
            </motion.p>
        </CardHeader>

        <CardContent className="relative grid grid-cols-1 gap-2 p-3 sm:grid-cols-3 sm:gap-4 sm:p-6">
           <motion.div
             variants={fadeInUp}
             className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-secondary/50 p-3 sm:gap-2 sm:p-4"
           >
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace sm:h-10 sm:w-10">
               <TrendingUp size={16} />
             </div>
             <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
               Income
             </p>
             <p className="text-lg font-bold text-workspace sm:text-xl">
               {formatCurrencyFull(balance.income, currency.code)}
             </p>
           </motion.div>

           <motion.div
             variants={fadeInUp}
             className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-secondary/50 p-3 sm:gap-2 sm:p-4"
           >
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 sm:h-10 sm:w-10">
               <TrendingDown size={16} />
             </div>
             <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
               Expenses
             </p>
             <p className="text-lg font-bold text-red-500 sm:text-xl">
               -{formatCurrencyFull(balance.expenses, currency.code)}
             </p>
           </motion.div>

           <motion.div
             variants={fadeInUp}
             className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-secondary/50 p-3 sm:gap-2 sm:p-4"
           >
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace sm:h-10 sm:w-10">
               <Wallet size={16} />
             </div>
             <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
               Remaining Budget
             </p>
             <p
               className={cn(
                 'text-lg font-bold sm:text-xl',
                 net >= 0 ? 'text-workspace' : 'text-red-500'
               )}
             >
               {formatCurrencyFull(net, currency.code)}
             </p>
           </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
