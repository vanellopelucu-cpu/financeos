import { motion, type Variants } from 'framer-motion'
import {
  BarChart3,
  CalendarDays,
  PiggyBank,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge, HealthBadge } from '../components/ui/Badge'
import { cn, formatCurrencyFull } from '../lib/utils'
import { isSupabaseConfigured } from '../lib/supabase'
import { DASHBOARD_DATA, MONTHLY_ANALYTICS_DATA } from '../lib/data'
import type { AnalyticsData, Transaction, WorkspaceId } from '../lib/types'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

interface SpendingCategory {
  id: string
  name: string
  icon: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

function calculateMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const monthlyMap = new Map<
    string,
    { name: string; income: number; expenses: number }
  >()

  transactions.forEach((tx) => {
    const date = new Date(tx.date)
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })

    if (!monthlyMap.has(yearMonth)) {
      monthlyMap.set(yearMonth, { name: monthName, income: 0, expenses: 0 })
    }

    const entry = monthlyMap.get(yearMonth)!
    if (tx.amount >= 0) {
      entry.income += tx.amount
    } else {
      entry.expenses += Math.abs(tx.amount)
    }
  })

  return Array.from(monthlyMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([, data]) => ({
      month: data.name,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
    }))
}

function getMonthlyData(workspace: WorkspaceId, transactions: Transaction[]): MonthlyData[] {
  if (isSupabaseConfigured) {
    return calculateMonthlyData(transactions)
  }
  return MONTHLY_ANALYTICS_DATA[workspace] || []
}

function getSpendingCategories(
  workspace: WorkspaceId,
  analytics: AnalyticsData
): SpendingCategory[] {
  if (analytics.categorySpending.length > 0) {
    return analytics.categorySpending.map((c) => ({
      id: c.category,
      name: c.category,
      icon: c.icon,
      amount: c.amount,
      percentage: c.percentage,
      trend: 'stable' as const,
    }))
  }
  const fallback = DASHBOARD_DATA.analytics[workspace]?.categorySpending || []
  return fallback.map((c) => ({
    id: c.category,
    name: c.category,
    icon: c.icon,
    amount: c.amount,
    percentage: c.percentage,
    trend: 'stable' as const,
  }))
}

function getHealthScore(score: number): 'excellent' | 'good' | 'fair' | 'needs-attention' {
  if (score >= 80) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 60) return 'fair'
  return 'needs-attention'
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return 'text-red-500'
    case 'down':
      return 'text-sri-500'
    default:
      return 'text-text-secondary'
  }
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp size={14} />
    case 'down':
      return <TrendingDown size={14} />
    default:
      return null
  }
}

function FinancialSummary() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { analytics } = useDashboardStore()

  const totalIncome = analytics.totalIncome
  const totalExpenses = analytics.totalExpense
  const netSavings = analytics.remainingBudget
  const savingsRate = analytics.savingsRate
  const healthScore = analytics.healthScore

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Financial Summary
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <PiggyBank size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-2 gap-6 md:grid-cols-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total Income
              </p>
              <p className="text-2xl font-bold text-sri-500">
                {formatCurrencyFull(totalIncome, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-500">
                -{formatCurrencyFull(totalExpenses, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Net Savings
              </p>
              <p className="text-2xl font-bold text-workspace">
                {formatCurrencyFull(netSavings, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Savings Rate
              </p>
              <p className="text-2xl font-bold text-text">{savingsRate}%</p>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    currentWorkspace.theme === 'green'
                      ? 'bg-gradient-to-r from-sri-400 to-sri-600'
                      : 'bg-gradient-to-r from-indo-400 to-indo-600'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${savingsRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Health Score
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-text">{healthScore}</p>
                <HealthBadge
                  health={getHealthScore(healthScore)}
                  workspace={currentWorkspace.theme === 'green'}
                />
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CashFlowChart() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions } = useDashboardStore()
  const monthlyData = getMonthlyData(currentWorkspace.id, transactions)

  const maxIncome = Math.max(...monthlyData.map((d) => d.income))
  const maxExpense = Math.max(...monthlyData.map((d) => d.expenses))
  const maxValue = Math.max(maxIncome, maxExpense)

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Cash Flow (Last 6 Months)
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <BarChart3 size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {monthlyData.map((month, index) => {
              const incomeHeight = (month.income / maxValue) * 100
              const expenseHeight = (month.expenses / maxValue) * 100

              return (
                <motion.div
                  key={month.month}
                  variants={cardVariants}
                  className="flex items-end gap-4"
                >
                  <div className="w-12 text-right">
                    <p className="text-sm font-medium text-text-secondary">
                      {month.month}
                    </p>
                  </div>
                  <div className="flex flex-1 items-end gap-2">
                    <motion.div
                      className="relative flex-1"
                      initial={{ height: 0 }}
                      animate={{ height: `${incomeHeight}%` }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.05, ease: 'easeOut' }}
                    >
                      <div
                        className={cn(
                          'h-full min-h-[4px] rounded-t-lg',
                          currentWorkspace.theme === 'green'
                            ? 'bg-gradient-to-t from-sri-400 to-sri-500'
                            : 'bg-gradient-to-t from-indo-400 to-indo-500'
                        )}
                      />
                      <div className="absolute -bottom-5 w-full text-center">
                        <p className="text-xs text-text-tertiary">
                          {formatCurrencyFull(month.income, currency.code)}
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="relative flex-1"
                      initial={{ height: 0 }}
                      animate={{ height: `${expenseHeight}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                    >
                      <div
                        className="h-full min-h-[4px] rounded-t-lg bg-gradient-to-t from-red-400 to-red-500"
                      />
                      <div className="absolute -bottom-5 w-full text-center">
                        <p className="text-xs text-text-tertiary">
                          {formatCurrencyFull(month.expenses, currency.code)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="mt-6 flex justify-center gap-8 border-t border-border/50 pt-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sri-500" />
              <span className="text-sm text-text-secondary">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-text-secondary">Expenses</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SpendingBreakdown() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { analytics } = useDashboardStore()
  const categories = getSpendingCategories(currentWorkspace.id, analytics)

  const maxAmount = Math.max(...categories.map((c) => c.amount))

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Spending Breakdown
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <ShoppingCart size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {categories.map((category) => {
              const progress = (category.amount / maxAmount) * 100

              return (
                <motion.div
                  key={category.id}
                  variants={cardVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-text">{category.name}</p>
                      <p className="text-sm font-semibold text-text">
                        {formatCurrencyFull(category.amount, currency.code)}
                      </p>
                    </div>
                    <div className="mt-2 relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          category.trend === 'up'
                            ? 'bg-gradient-to-r from-red-400 to-red-500'
                            : category.trend === 'down'
                              ? 'bg-gradient-to-r from-sri-400 to-sri-500'
                              : 'bg-gradient-to-r from-indo-400 to-indo-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-xs font-medium',
                        getTrendColor(category.trend)
                      )}
                    >
                      {getTrendIcon(category.trend)}
                      {category.percentage}%
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MonthlyTrend() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions } = useDashboardStore()
  const monthlyData = getMonthlyData(currentWorkspace.id, transactions)

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const totalSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0)

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Monthly Trend (Last 6 Months)
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <TrendingUp size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {monthlyData.map((month) => {
              const savingsPercentage =
                month.income > 0 ? (month.savings / month.income) * 100 : 0

              return (
                <motion.div
                  key={month.month}
                  variants={cardVariants}
                  whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                  className="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                    📅
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-text">{month.month} 2026</p>
                      <p className="text-sm text-text-secondary">
                        Savings rate: {Math.round(savingsPercentage)}%
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-text-tertiary">Income</p>
                        <p className="font-semibold text-sri-500">
                          {formatCurrencyFull(month.income, currency.code)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Expenses</p>
                        <p className="font-semibold text-red-500">
                          {formatCurrencyFull(month.expenses, currency.code)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Savings</p>
                        <p className="font-semibold text-workspace">
                          {formatCurrencyFull(month.savings, currency.code)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            <motion.div
              variants={cardVariants}
              className="mt-4 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Total Income
                  </p>
                  <p className="text-xl font-bold text-sri-500">
                    {formatCurrencyFull(totalIncome, currency.code)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Total Expenses
                  </p>
                  <p className="text-xl font-bold text-red-500">
                    {formatCurrencyFull(totalExpenses, currency.code)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Total Savings
                  </p>
                  <p className="text-xl font-bold text-workspace">
                    {formatCurrencyFull(totalSavings, currency.code)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TopSpendingCategories() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { analytics } = useDashboardStore()
  const categories = [...getSpendingCategories(currentWorkspace.id, analytics)].sort(
    (a, b) => b.amount - a.amount
  )

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Top Spending Categories
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <BarChart3 size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <motion.div
            className="divide-y divide-border/50"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={cardVariants}
                whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                className="flex items-center gap-4 p-4 transition-all"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text">{category.name}</p>
                      <p className="text-sm text-text-secondary">
                        #{index + 1} category
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text">
                        {formatCurrencyFull(category.amount, currency.code)}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            getTrendColor(category.trend)
                          )}
                        >
                          {getTrendIcon(category.trend)}
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FinancialInsights() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { analytics } = useDashboardStore()
  const isIndonesia = currentWorkspace.id === 'indonesia'

  const insights = isIndonesia
    ? [
        {
          icon: '📈',
          title: 'Savings Improved',
          description: `Your savings rate increased to ${analytics.savingsRate}% this month, up from 47% last month.`,
          type: 'success' as const,
        },
        {
          icon: '🏦',
          title: 'Emergency Fund Growing',
          description: 'You have allocated Rp 4,300,000 to savings this month.',
          type: 'success' as const,
        },
        {
          icon: '💡',
          title: 'Bills Remain Stable',
          description: 'Utility and bill expenses are consistent with last month.',
          type: 'info' as const,
        },
        {
          icon: '🛍️',
          title: 'Shopping Decreased',
          description: 'Shopping expenses dropped 12% compared to last month.',
          type: 'success' as const,
        },
      ]
    : [
        {
          icon: '📉',
          title: 'Spending Increased',
          description: 'Your spending increased 8% from last month, primarily in Food.',
          type: 'warning' as const,
        },
        {
          icon: '💰',
          title: 'Savings Improved',
          description: `Net savings reached ${formatCurrencyFull(analytics.remainingBudget, currency.code)}, up from Rs 35,000 last month.`,
          type: 'success' as const,
        },
        {
          icon: '💡',
          title: 'Bills Remain Stable',
          description: 'Bill expenses are consistent with last month at Rs 45,000.',
          type: 'info' as const,
        },
        {
          icon: '🛍️',
          title: 'Shopping Decreased',
          description: 'Shopping expenses dropped 15% compared to last month.',
          type: 'success' as const,
        },
      ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Financial Insights
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <TrendingUp size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-start gap-4 rounded-xl border p-4 transition-all',
                  insight.type === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : insight.type === 'success'
                      ? 'border-sri-500/30 bg-sri-500/5'
                      : 'border-border/50 bg-secondary/50'
                )}
              >
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-secondary">
                    {insight.title}
                  </p>
                  <p className="mt-1 text-sm text-text">
                    {insight.description}
                  </p>
                </div>
                <Badge
                  variant={
                    insight.type === 'warning'
                      ? 'warning'
                      : insight.type === 'success'
                        ? 'success'
                        : 'secondary'
                  }
                  size="sm"
                >
                  {insight.type === 'warning'
                    ? 'Attention'
                    : insight.type === 'success'
                      ? 'Positive'
                      : 'Info'}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SmartRecommendations() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { analytics } = useDashboardStore()
  const isIndonesia = currentWorkspace.id === 'indonesia'

  const recommendations = isIndonesia
    ? [
        {
          icon: '🏦',
          title: 'Increase Emergency Savings',
          description:
            'Consider allocating an additional Rp 500,000 to your emergency fund this month.',
          type: 'success' as const,
        },
        {
          icon: '🎯',
          title: 'Maintain Current Pace',
          description:
            'Your savings consistency is excellent. Keep up the great work!',
          type: 'success' as const,
        },
        {
          icon: '🛍️',
          title: 'Optimize Shopping',
          description:
            'You spent Rp 950,000 on shopping. Consider setting a monthly cap.',
          type: 'info' as const,
        },
        {
          icon: '📈',
          title: 'Excellent Saving Consistency',
            description:
              `Your savings rate of ${analytics.savingsRate}% is above the recommended 20% threshold.`,
          type: 'success' as const,
        },
      ]
    : [
        {
          icon: '🍽️',
          title: 'Reduce Dining Expenses',
          description:
            `Food spending is at ${formatCurrencyFull(38500, currency.code)} (28% of budget). Try cooking at home more often.`,
          type: 'warning' as const,
        },
        {
          icon: '🏦',
          title: 'Increase Emergency Savings',
          description:
            `Add ${formatCurrencyFull(10000, currency.code)} more to your emergency fund this month.`,
          type: 'info' as const,
        },
        {
          icon: '🎯',
          title: 'Maintain Current Budget Pace',
            description:
              `Your savings rate of ${analytics.savingsRate}% is on track. Keep maintaining this consistency.`,
          type: 'success' as const,
        },
        {
          icon: '🛍️',
          title: 'Optimize Shopping',
          description:
            'Shopping expenses are below target. Consider reallocating to savings.',
          type: 'success' as const,
        },
      ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-glass dark:shadow-glass-dark">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Smart Recommendations
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Wallet size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -2 }}
                className={cn(
                  'flex items-start gap-4 rounded-xl border p-4 transition-all',
                  rec.type === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : rec.type === 'success'
                      ? 'border-sri-500/30 bg-sri-500/5'
                      : 'border-border/50 bg-secondary/50'
                )}
              >
                <span className="text-2xl">{rec.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-text">{rec.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {rec.description}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-border'
                  )}
                >
                  Apply
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Analytics() {
  const { currentWorkspace } = useWorkspace()

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      <motion.div
        variants={rowVariants}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
            <BarChart3 size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Analytics
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <CalendarDays size={14} className="text-text-tertiary" />
          <span>{dateLabel}</span>
          <span className="mx-2 text-text-tertiary">·</span>
          <span className="font-medium text-text">
            {currentWorkspace.name} • {currentWorkspace.currency.symbol}
          </span>
        </div>
      </motion.div>

      <FinancialSummary />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <CashFlowChart />
        </div>
        <div>
          <SpendingBreakdown />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <MonthlyTrend />
        </div>
        <div>
          <TopSpendingCategories />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <FinancialInsights />
        </div>
        <div>
          <SmartRecommendations />
        </div>
      </div>
    </motion.div>
  )
}
