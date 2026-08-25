import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../../app/providers/ThemeContext'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { HealthBadge } from '../../../components/ui/Badge'
import { cn, formatCurrencyFull, formatRupiahCompact } from '../../../lib/utils'

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

interface ChartDataPoint {
  date: string
  label: string
  income: number
  expenses: number
}

export function HeroBalanceCard() {
  const { theme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const { balance, transactions } = useDashboardStore()
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
  const [showBalance, setShowBalance] = useState(true)

  const maskedBalance = 'Rp••••••••'

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyData: Record<string, { income: number; expenses: number }> = {}

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      dailyData[key] = { income: 0, expenses: 0 }
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.date)
      if (tDate >= thirtyDaysAgo && tDate <= now) {
        const key = t.date
        if (dailyData[key]) {
          if (t.amount >= 0) {
            dailyData[key].income += t.amount
          } else {
            dailyData[key].expenses += Math.abs(t.amount)
          }
        }
      }
    })

    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const d = new Date(date)
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return {
          date,
          label,
          income: data.income,
          expenses: data.expenses,
        }
      })
  }, [transactions])

  const hasData = chartData.some((d) => d.income > 0 || d.expenses > 0)
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#1e293b' : '#e2e8f0'

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

         {/* Desktop: 2-column layout */}
         <div className="hidden md:grid md:grid-cols-5">
           <div className="col-span-3">
             <CardHeader className="relative border-b border-border/50 p-4 pb-4 sm:p-5 sm:pb-5 lg:p-8 lg:pb-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary sm:text-sm">
                    Available Balance
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <HealthBadge
                      health={financialHealth()}
                      workspace={currentWorkspace.theme === 'green'}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 sm:mt-3">
                  <motion.p
                    variants={fadeInUp}
                    className="text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl xl:text-5xl"
                  >
                    {showBalance ? formatCurrencyFull(balance.availableBalance, currency.code) : maskedBalance}
                  </motion.p>
                  <button
                    type="button"
                    onClick={() => setShowBalance(!showBalance)}
                    aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-secondary hover:text-text sm:h-8 sm:w-8"
                  >
                    {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
               <motion.p
                 variants={fadeInUp}
                 className="mt-1 text-xs text-text-secondary sm:mt-2 sm:text-sm"
               >
                 Available to Spend: {formatCurrencyFull(balance.safeSpending, currency.code)}
               </motion.p>
             </CardHeader>
             <CardContent className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-5">
               <motion.div
                 variants={fadeInUp}
                 className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-2 sm:gap-1.5 sm:p-3 lg:p-4"
               >
                 <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-workspace/10 text-workspace sm:h-6 sm:w-6 lg:h-7 lg:w-7">
                   <TrendingUp size={11} />
                 </div>
                 <p className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:text-[10px] lg:text-xs">
                   Income
                 </p>
                 <p className="w-full truncate text-center text-xs font-bold text-workspace sm:text-sm lg:text-base">
                   {formatCurrencyFull(balance.income, currency.code)}
                 </p>
               </motion.div>

               <motion.div
                 variants={fadeInUp}
                 className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-2 sm:gap-1.5 sm:p-3 lg:p-4"
               >
                 <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-500 sm:h-6 sm:w-6 lg:h-7 lg:w-7">
                   <TrendingDown size={11} />
                 </div>
                 <p className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:text-[10px] lg:text-xs">
                   Expenses
                 </p>
                 <p className="w-full truncate text-center text-xs font-bold text-red-500 sm:text-sm lg:text-base">
                   -{formatCurrencyFull(balance.expenses, currency.code)}
                 </p>
               </motion.div>

               <motion.div
                 variants={fadeInUp}
                 className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-2 sm:gap-1.5 sm:p-3 lg:p-4"
               >
                 <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-workspace/10 text-workspace sm:h-6 sm:w-6 lg:h-7 lg:w-7">
                   <Wallet size={11} />
                 </div>
                 <p className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:text-[10px] lg:text-xs">
                   Remaining
                 </p>
                 <p
                   className={cn(
                     'w-full truncate text-center text-xs font-bold sm:text-sm lg:text-base',
                     net >= 0 ? 'text-workspace' : 'text-red-500'
                   )}
                 >
                   {formatCurrencyFull(net, currency.code)}
                 </p>
               </motion.div>
             </CardContent>
           </div>

           <div className="col-span-2 border-l border-border/50 p-4 sm:p-5 lg:p-8">
             <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary sm:mb-4 sm:text-sm">
               Cash Flow (30 Days)
             </p>
             {!hasData ? (
               <div className="flex h-40 items-center justify-center text-xs text-text-secondary sm:h-48 lg:h-56">
                 No transactions
               </div>
             ) : (
               <div className="h-40 sm:h-48 lg:h-56">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                     <XAxis
                       dataKey="label"
                       tick={{ fontSize: 9, fill: textColor }}
                       tickLine={false}
                       axisLine={{ stroke: gridColor }}
                       interval="preserveStartEnd"
                     />
                     <YAxis
                       tick={{ fontSize: 9, fill: textColor }}
                       tickLine={false}
                       axisLine={{ stroke: gridColor }}
                       tickFormatter={(v) => formatRupiahCompact(v)}
                       width={40}
                     />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: isDark ? '#1e293b' : '#ffffff',
                         border: `1px solid ${gridColor}`,
                         borderRadius: '8px',
                         fontSize: '11px',
                       }}
                       labelStyle={{ color: textColor }}
                       formatter={(value: unknown, name: unknown) => [
                         formatCurrencyFull(Number(value), 'IDR'),
                         String(name).charAt(0).toUpperCase() + String(name).slice(1),
                       ]}
                     />
                     <Line
                       type="monotone"
                       dataKey="income"
                       stroke="#22c55e"
                       strokeWidth={2}
                       dot={false}
                       activeDot={{ r: 3 }}
                     />
                     <Line
                       type="monotone"
                       dataKey="expenses"
                       stroke="#ef4444"
                       strokeWidth={2}
                       dot={false}
                       activeDot={{ r: 3 }}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             )}
             <div className="mt-3 flex items-center gap-3 sm:mt-4">
               <div className="flex items-center gap-1">
                 <div className="h-2 w-2 rounded-full bg-green-500" />
                 <span className="text-[9px] text-text-secondary sm:text-[10px]">Income</span>
               </div>
               <div className="flex items-center gap-1">
                 <div className="h-2 w-2 rounded-full bg-red-500" />
                 <span className="text-[9px] text-text-secondary sm:text-[10px]">Expenses</span>
               </div>
             </div>
           </div>
         </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden">
          <CardHeader className="relative border-b border-border/50 p-4 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Available Balance
              </CardTitle>
              <HealthBadge
                health={financialHealth()}
                workspace={currentWorkspace.theme === 'green'}
              />
            </div>
            <div className="mt-2 flex items-center gap-2 sm:mt-3">
              <motion.p
                variants={fadeInUp}
                className="text-2xl font-black tracking-tight text-text"
              >
                {showBalance ? formatCurrencyFull(balance.availableBalance, currency.code) : maskedBalance}
              </motion.p>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-secondary hover:text-text sm:h-8 sm:w-8"
              >
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <motion.p
              variants={fadeInUp}
              className="mt-1 text-xs text-text-secondary sm:mt-2"
            >
              Available to Spend: {formatCurrencyFull(balance.safeSpending, currency.code)}
            </motion.p>
          </CardHeader>

          <div className="border-b border-border/50 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary sm:mb-4">
              Cash Flow (30 Days)
            </p>
            {!hasData ? (
              <div className="flex h-32 items-center justify-center text-xs text-text-secondary">
                No transactions
              </div>
            ) : (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 8, fill: textColor }}
                      tickLine={false}
                      axisLine={{ stroke: gridColor }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 8, fill: textColor }}
                      tickLine={false}
                      axisLine={{ stroke: gridColor }}
                      tickFormatter={(v) => formatRupiahCompact(v)}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${gridColor}`,
                        borderRadius: '8px',
                        fontSize: '10px',
                      }}
                      labelStyle={{ color: textColor }}
                      formatter={(value: unknown, name: unknown) => [
                        formatCurrencyFull(Number(value), 'IDR'),
                        String(name).charAt(0).toUpperCase() + String(name).slice(1),
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 sm:mt-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-[9px] text-text-secondary sm:text-[10px]">Income</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[9px] text-text-secondary sm:text-[10px]">Expenses</span>
              </div>
            </div>
          </div>

          <CardContent className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
            <motion.div
              variants={fadeInUp}
              className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-2 sm:gap-1.5 sm:p-3"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-workspace/10 text-workspace sm:h-6 sm:w-6">
                <TrendingUp size={11} />
              </div>
              <p className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:text-[10px]">
                Income
              </p>
              <p className="w-full truncate text-center text-xs font-bold text-workspace sm:text-sm">
                {formatCurrencyFull(balance.income, currency.code)}
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-2 sm:gap-1.5 sm:p-3"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-500 sm:h-6 sm:w-6">
                <TrendingDown size={11} />
              </div>
              <p className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:text-[10px]">
                Expenses
              </p>
              <p className="w-full truncate text-center text-xs font-bold text-red-500 sm:text-sm">
                -{formatCurrencyFull(balance.expenses, currency.code)}
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-2 sm:gap-1.5 sm:p-3"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-workspace/10 text-workspace sm:h-6 sm:w-6">
                <Wallet size={11} />
              </div>
              <p className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:text-[10px]">
                Remaining
              </p>
              <p
                className={cn(
                  'w-full truncate text-center text-xs font-bold sm:text-sm',
                  net >= 0 ? 'text-workspace' : 'text-red-500'
                )}
              >
                {formatCurrencyFull(net, currency.code)}
              </p>
            </motion.div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}
