import { motion, type Variants } from 'framer-motion'
import {
  AlertCircle,
  CalendarDays,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge, HealthBadge } from '../components/ui/Badge'
import { cn, formatCurrencyFull } from '../lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function getBudgetStatus(spent: number, allocated: number): 'Safe' | 'Warning' | 'Over Budget' {
  const percentage = (spent / allocated) * 100
  if (percentage >= 100) return 'Over Budget'
  if (percentage >= 80) return 'Warning'
  return 'Safe'
}

function getStatusColor(status: 'Safe' | 'Warning' | 'Over Budget') {
  switch (status) {
    case 'Safe':
      return 'bg-sri-500/10 text-sri-400 border-sri-500/30'
    case 'Warning':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'Over Budget':
      return 'bg-red-500/10 text-red-400 border-red-500/30'
    default:
      return 'bg-sri-500/10 text-sri-400 border-sri-500/30'
  }
}

function getProgressBarColor(progress: number, workspaceTheme: 'green' | 'blue') {
  if (progress >= 100) return 'bg-red-500'
  if (progress >= 80) return workspaceTheme === 'green' ? 'bg-amber-500' : 'bg-amber-500'
  return workspaceTheme === 'green' ? 'bg-sri-500' : 'bg-indo-500'
}

function BudgetOverview() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace

  const { budgets: categories } = useDashboardStore()
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)
  const remaining = totalAllocated - totalSpent
  const usagePercentage = totalAllocated > 0 ? Math.min(100, (totalSpent / totalAllocated) * 100) : 0

  return (
    <motion.div variants={rowVariants}>
      <Card
        glass
        elevated
        className="border-0 p-0 shadow-2xl"
      >
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Budget Overview
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Wallet size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total Budget
              </p>
              <p className="text-2xl font-bold text-text">
                {formatCurrencyFull(totalAllocated, currency.code)}
              </p>
              <p className="text-sm text-text-secondary">
                Across {categories.length} categories
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrencyFull(totalSpent, currency.code)}
              </p>
              <p className="text-sm text-text-secondary">
                {Math.round(usagePercentage)}% of budget
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Remaining
              </p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  remaining >= 0 ? 'text-workspace' : 'text-red-500'
                )}
              >
                {formatCurrencyFull(remaining, currency.code)}
              </p>
              <p className="text-sm text-text-secondary">
                {remaining >= 0 ? 'Under budget' : 'Over budget'}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Usage
              </p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-text">
                  {Math.round(usagePercentage)}%
                </p>
                <HealthBadge
                  health={
                    usagePercentage >= 100
                      ? 'needs-attention'
                      : usagePercentage >= 80
                        ? 'fair'
                        : usagePercentage >= 50
                          ? 'good'
                          : 'excellent'
                  }
                  workspace={currentWorkspace.theme === 'green'}
                />
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    getProgressBarColor(usagePercentage, currentWorkspace.theme)
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, usagePercentage)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BudgetCategories() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { budgets: categories } = useDashboardStore()

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Budget Categories
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Target size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            {categories.map((category) => {
              const spent = category.spent
              const allocated = category.allocated
              const remaining = allocated - spent
              const percentage = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0
              const status = getBudgetStatus(spent, allocated)
              const statusConfig = {
                classes: getStatusColor(status),
                label: status,
              }

              return (
                <motion.div
                  key={category.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 p-5 transition-all duration-300'
                  )}
                >
                  <div className="absolute inset-0 -z-10">
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                        currentWorkspace.theme === 'green'
                          ? 'bg-gradient-to-br from-sri-500/5 to-transparent'
                          : 'bg-gradient-to-br from-indo-500/5 to-transparent'
                      )}
                    />
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl">{category.icon}</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                        statusConfig.classes
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-text">
                    {category.name}
                  </h3>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-text">
                        {formatCurrencyFull(spent, currency.code)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        of {formatCurrencyFull(allocated, currency.code)}
                      </p>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          getProgressBarColor(percentage, currentWorkspace.theme)
                        )}
                        style={{ width: `${percentage}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-text-tertiary">
                        {Math.round(percentage)}% used
                      </span>
                      <span className="text-xs font-medium text-text-secondary">
                        {formatCurrencyFull(Math.abs(remaining), currency.code)}{' '}
                        {remaining >= 0 ? 'remaining' : 'over'}
                      </span>
                    </div>
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

function BudgetProgress() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { budgets: categories } = useDashboardStore()

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Budget Progress
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <PieChart size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            {categories.map((category) => {
              const percentage =
                category.allocated > 0
                  ? Math.min(100, (category.spent / category.allocated) * 100)
                  : 0

              return (
                <motion.div key={category.id} variants={cardVariants}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-text">{category.name}</p>
                        <p className="text-sm text-text-secondary">
                          {formatCurrencyFull(category.spent, currency.code)}{' '}
                          <span className="text-text-tertiary">
                            of {formatCurrencyFull(category.allocated, currency.code)}
                          </span>
                        </p>
                      </div>
                      <div className="mt-2 relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                        <motion.div
                          className={cn(
                            'h-full rounded-full',
                            getProgressBarColor(percentage, currentWorkspace.theme)
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            <motion.div
              variants={cardVariants}
              className="mt-6 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-text">
                      {formatCurrencyFull(totalSpent, currency.code)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                      Allocated
                    </p>
                  <p className="text-2xl font-bold text-workspace">
                    {formatCurrencyFull(totalAllocated, currency.code)}
                  </p>
                </div>
              </div>
              <div className="mt-3 relative h-3 w-full overflow-hidden rounded-full bg-border/50">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    getProgressBarColor(
                      totalAllocated > 0
                        ? (totalSpent / totalAllocated) * 100
                        : 0,
                      currentWorkspace.theme
                    )
                  )}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${totalAllocated > 0 ? Math.min(100, (totalSpent / totalAllocated) * 100) : 0}%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BudgetInsights() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { budgets: categories } = useDashboardStore()

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)
  const remaining = totalAllocated - totalSpent

  const largestCategory = categories.length > 0
    ? categories.reduce((max, c) => (c.spent > max.spent ? c : max))
    : { name: 'N/A', spent: 0, allocated: 0 }
  const largestPercentage =
    largestCategory.allocated > 0
      ? (largestCategory.spent / largestCategory.allocated) * 100
      : 0

  const overBudgetCategories = categories.filter(
    (c) => c.spent > c.allocated
  )
  const warningCategories = categories.filter(
    (c) => c.spent >= c.allocated * 0.8 && c.spent < c.allocated
  )

  const healthyCategories = categories.filter(
    (c) => c.spent < c.allocated * 0.8
  )

  const isIndonesia = currentWorkspace.id === 'indonesia'
  const paceLabel = isIndonesia ? 'Savings pace' : 'Spending pace'
  const paceDescription = isIndonesia
    ? `${formatCurrencyFull(remaining, currency.code)} available for savings`
    : `${formatCurrencyFull(remaining, currency.code)} remaining this month`

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Budget Insights
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
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            <motion.div
              variants={cardVariants}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Target size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">
                  Largest Spending Category
                </p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {largestCategory.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatCurrencyFull(largestCategory.spent, currency.code)}{' '}
                  <span className="text-text-tertiary">
                    ({Math.round(largestPercentage)}% of allocation)
                  </span>
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
                <Wallet size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">
                  Remaining Budget
                </p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {formatCurrencyFull(remaining, currency.code)}
                </p>
                <p className="text-sm text-text-secondary">{paceDescription}</p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sri-500/10 text-sri-500">
                <TrendingDown size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">
                  {paceLabel}
                </p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {Math.round(
                    totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
                  )}
                  %
                </p>
                <p className="text-sm text-text-secondary">
                  {overBudgetCategories.length > 0
                    ? `${overBudgetCategories.length} categor${overBudgetCategories.length > 1 ? 'ies' : 'y'} over budget`
                    : healthyCategories.length > 0
                      ? `${healthyCategories.length} categor${healthyCategories.length > 1 ? 'ies' : 'y'} on track`
                      : 'All categories on track'}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <TrendingUp size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">
                  Monthly Recommendation
                </p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {overBudgetCategories.length > 0
                    ? `Reduce spending in ${overBudgetCategories.map(c => c.name).join(', ')}`
                    : remaining > 0
                      ? `You have ${formatCurrencyFull(remaining, currency.code)} left to allocate`
                      : 'Review your budget allocations for next month'}
                </p>
                <p className="text-sm text-text-secondary">
                  {warningCategories.length > 0
                    ? `${warningCategories.length} categor${warningCategories.length > 1 ? 'ies' : 'y'} nearing limit`
                    : 'All categories within safe range'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BudgetAlerts() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { budgets: categories } = useDashboardStore()

  const alerts = categories
    .map((category) => {
      const percentage =
        category.allocated > 0
          ? (category.spent / category.allocated) * 100
          : 0
      const status = getBudgetStatus(category.spent, category.allocated)

      if (percentage >= 100) {
        return {
          category: category.name,
          icon: category.icon,
          message: `${category.name} budget exceeded by ${formatCurrencyFull(category.spent - category.allocated, currency.code)}`,
          type: 'destructive' as const,
          priority: 3,
        }
      }
      if (percentage >= 90) {
        return {
          category: category.name,
          icon: category.icon,
          message: `${category.name} budget is at ${Math.round(percentage)}%`,
          type: 'warning' as const,
          priority: 2,
        }
      }
      if (status === 'Safe' && percentage > 50) {
        return {
          category: category.name,
          icon: category.icon,
          message: `${category.name} spending is healthy at ${Math.round(percentage)}%`,
          type: 'success' as const,
          priority: 1,
        }
      }
      return null
    })
    .filter((alert): alert is NonNullable<typeof alert> => alert !== null)
    .sort((a, b) => b.priority - a.priority)

  if (alerts.length === 0) {
    return null
  }

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Budget Alerts
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <AlertCircle size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            {alerts.map((alert, index) => (
              <motion.div
                key={`${alert.category}-${index}`}
                variants={cardVariants}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-all',
                  alert.type === 'destructive'
                    ? 'border-red-500/30 bg-red-500/5'
                    : alert.type === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-sri-500/30 bg-sri-500/5'
                )}
              >
                <span className="text-2xl">{alert.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">{alert.category}</p>
                  <p className="font-medium text-text">{alert.message}</p>
                </div>
                <Badge variant={alert.type} size="sm">
                  {alert.type === 'destructive'
                    ? 'Over Budget'
                    : alert.type === 'warning'
                      ? 'Warning'
                      : 'Healthy'}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Budgets() {
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
            <PieChart size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Budgets
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

      <BudgetOverview />

      <BudgetCategories />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <BudgetProgress />
        </div>
        <div>
          <BudgetInsights />
        </div>
      </div>

      <BudgetAlerts />
    </motion.div>
  )
}
