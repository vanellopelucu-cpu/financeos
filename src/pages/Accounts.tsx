import { motion, type Variants } from 'framer-motion'
import {
  CalendarDays,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge, HealthBadge } from '../components/ui/Badge'
import { cn, formatCurrencyFull, getCategoryIcon } from '../lib/utils'

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

interface AccountActivity {
  id: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'adjustment'
  description: string
  amount: number
  account: string
  accountIcon: string
  date: string
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'deposit':
      return <TrendingUp size={16} className="text-sri-500" />
    case 'withdrawal':
      return <TrendingDown size={16} className="text-red-500" />
    case 'transfer':
      return <CreditCard size={16} className="text-workspace" />
    default:
      return <Wallet size={16} className="text-text-tertiary" />
  }
}

function TotalAssetsOverview() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { accounts } = useDashboardStore()

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const cashAvailable = accounts
    .filter((acc) => acc.type === 'Checking' || acc.type === 'Cash' || acc.type === 'Digital')
    .reduce((sum, acc) => sum + acc.balance, 0)
  const savings = accounts
    .filter((acc) => acc.type === 'Savings')
    .reduce((sum, acc) => sum + acc.balance, 0)

  const isIndonesia = currentWorkspace.id === 'indonesia'
  const investmentsLabel = isIndonesia ? 'Investments' : 'Investments'
  const investments = isIndonesia
    ? Math.round(totalBalance * 0.15)
    : Math.round(totalBalance * 0.05)

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-2xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Total Assets Overview
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Wallet size={16} />
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
                Total Balance
              </p>
              <p className="text-2xl font-bold text-text">
                {formatCurrencyFull(totalBalance, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Cash Available
              </p>
              <p className="text-2xl font-bold text-sri-500">
                {formatCurrencyFull(cashAvailable, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Savings
              </p>
              <p className="text-2xl font-bold text-indo-500">
                {formatCurrencyFull(savings, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                {investmentsLabel}
              </p>
              <p className="text-2xl font-bold text-text">
                {formatCurrencyFull(investments, currency.code)}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Accounts
              </p>
              <p className="text-2xl font-bold text-text">{accounts.length}</p>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MyAccounts() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { accounts } = useDashboardStore()

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              My Accounts
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Landmark size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {accounts.map((account) => (
              <motion.div
                key={account.id}
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
                  <span className="text-3xl">{account.icon}</span>
                  <Badge
                    variant={account.status === 'primary' ? 'workspace' : 'secondary'}
                    size="sm"
                  >
                    {account.status === 'primary' ? 'Primary' : 'Active'}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-text">
                  {account.name}
                </h3>
                <p className="text-sm text-text-secondary">{account.type}</p>

                <div className="mt-3 space-y-2">
                  <p className="text-2xl font-bold text-text">
                    {formatCurrencyFull(account.balance, currency.code)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {account.accountNumber}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Updated: {account.lastUpdated}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AccountAllocation() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { accounts } = useDashboardStore()
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Account Allocation
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <PieChartIcon />
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
            {accounts.map((account) => {
              const percentage =
                totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0

              return (
                <motion.div
                  key={account.id}
                  variants={cardVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                    {account.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-text">{account.name}</p>
                      <p className="text-sm font-semibold text-text">
                        {formatCurrencyFull(account.balance, currency.code)}
                      </p>
                    </div>
                    <div className="mt-2 relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          currentWorkspace.theme === 'green'
                            ? 'bg-gradient-to-r from-sri-400 to-sri-600'
                            : 'bg-gradient-to-r from-indo-400 to-indo-600'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <span className="text-sm font-medium text-text-secondary">
                      {Math.round(percentage)}%
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

function RecentAccountActivity() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions, accounts } = useDashboardStore()
  const primaryAccount =
    accounts.find((acc) => acc.status === 'primary') || accounts[0]
  const activities: AccountActivity[] = transactions
    .map((tx): AccountActivity => ({
      id: tx.id,
      type: tx.amount >= 0 ? 'deposit' : 'withdrawal',
      description: tx.description,
      amount: tx.amount,
      account: primaryAccount?.name || '',
      accountIcon: tx.icon || getCategoryIcon(tx.category),
      date: tx.date,
    }))
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Recent Account Activity
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <CreditCard size={16} />
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
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                variants={cardVariants}
                whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                className="flex items-center gap-4 p-4 transition-all"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                  {activity.accountIcon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <p className="font-medium text-text">{activity.description}</p>
                  </div>
                  <p className="text-sm text-text-secondary">{activity.account}</p>
                  <p className="text-xs text-text-tertiary">{activity.date}</p>
                </div>
                <div className="flex flex-shrink-0 items-center justify-end gap-2">
                  <span
                     className={cn(
                       'font-semibold',
                       activity.type === 'deposit'
                         ? 'text-sri-500'
                         : activity.type === 'withdrawal'
                           ? 'text-error-500 dark:text-error-400'
                           : 'text-workspace'
                     )}
                  >
                    {activity.type === 'deposit' ? '+' : activity.type === 'withdrawal' ? '-' : ''}
                    {formatCurrencyFull(activity.amount, currency.code)}
                  </span>
                  <Badge
                    variant={
                      activity.type === 'deposit'
                        ? 'success'
                        : activity.type === 'withdrawal'
                          ? 'destructive'
                          : 'workspace'
                    }
                    size="sm"
                  >
                    {activity.type}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FinancialHealth() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { accounts } = useDashboardStore()

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const savingsAccount = accounts.find((acc) => acc.type === 'Savings')
  const savings = savingsAccount ? savingsAccount.balance : 0
  const cashAccounts = accounts.filter(
    (acc) => acc.type === 'Checking' || acc.type === 'Cash' || acc.type === 'Digital'
  )
  const cashAvailable = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0)

  const emergencyFund = savings
  const liquidity = totalBalance > 0 ? (cashAvailable / totalBalance) * 100 : 0
  const cashRatio = totalBalance > 0 ? (cashAvailable / totalBalance) * 100 : 0
  const savingsGrowth = totalBalance > 0 ? (savings / totalBalance) * 100 : 0

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Financial Health
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
            <motion.div
              variants={cardVariants}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sri-500/10 text-sri-500">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Emergency Fund
                  </p>
                  <p className="text-xl font-bold text-text">
                    {formatCurrencyFull(emergencyFund, currency.code)}
                  </p>
                </div>
              </div>
              <HealthBadge
                health={
                  emergencyFund > 100000
                    ? 'excellent'
                    : emergencyFund > 50000
                      ? 'good'
                      : 'needs-attention'
                }
                workspace={currentWorkspace.theme === 'green'}
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indo-500/10 text-indo-500">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Liquidity
                  </p>
                  <p className="text-xl font-bold text-text">
                    {Math.round(liquidity)}%
                  </p>
                </div>
              </div>
              <HealthBadge
                health={
                  liquidity >= 70
                    ? 'excellent'
                    : liquidity >= 50
                      ? 'good'
                      : 'needs-attention'
                }
                workspace={currentWorkspace.theme === 'green'}
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-500/10 dark:bg-warning-500/20 text-warning-500 dark:text-warning-400">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Cash Ratio
                  </p>
                  <p className="text-xl font-bold text-text">
                    {Math.round(cashRatio)}%
                  </p>
                </div>
              </div>
              <HealthBadge
                health={
                  cashRatio >= 60
                    ? 'excellent'
                    : cashRatio >= 40
                      ? 'good'
                      : 'needs-attention'
                }
                workspace={currentWorkspace.theme === 'green'}
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sri-500/10 text-sri-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Savings Growth
                  </p>
                  <p className="text-xl font-bold text-text">
                    {Math.round(savingsGrowth)}%
                  </p>
                </div>
              </div>
              <HealthBadge
                health={
                  savingsGrowth >= 50
                    ? 'excellent'
                    : savingsGrowth >= 30
                      ? 'good'
                      : 'needs-attention'
                }
                workspace={currentWorkspace.theme === 'green'}
              />
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickInsights() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { accounts } = useDashboardStore()

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const primaryAccount = accounts.find((acc) => acc.status === 'primary')
  const primaryPercentage =
    totalBalance > 0 && primaryAccount
      ? (primaryAccount.balance / totalBalance) * 100
      : 0

  const isIndonesia = currentWorkspace.id === 'indonesia'

  const insights = [
    {
      icon: '🏦',
      title: 'Primary Account Allocation',
      description: `${primaryAccount?.name} holds ${Math.round(primaryPercentage)}% of total assets (${formatCurrencyFull(primaryAccount?.balance || 0, currency.code)})`,
      type: 'info' as const,
    },
    {
      icon: '📈',
      title: 'Savings Growth',
      description: isIndonesia
        ? `Savings increased to ${formatCurrencyFull(accounts.find(a => a.type === 'Savings')?.balance || 0, currency.code)} this month`
        : `Savings reached ${formatCurrencyFull(accounts.find(a => a.type === 'Savings')?.balance || 0, currency.code)} this month`,
      type: 'success' as const,
    },
    {
      icon: '🛡️',
      title: 'Emergency Fund',
      description: isIndonesia
        ? 'Emergency fund is healthy at Rp 15,000,000'
        : 'Emergency fund is healthy at Rs 125,000',
      type: 'success' as const,
    },
    {
      icon: '⚖️',
      title: 'Account Balance',
      description: 'Consider balancing funds across accounts for better liquidity',
      type: 'info' as const,
    },
  ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Quick Insights
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <SmartIcon />
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
                  insight.type === 'success'
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
                  variant={insight.type === 'success' ? 'success' : 'secondary'}
                  size="sm"
                >
                  {insight.type === 'success' ? 'Positive' : 'Info'}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PieChartIcon() {
  return <PieChartIconImpl size={16} />
}

function PieChartIconImpl({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-workspace"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SmartIcon() {
  return <SmartIconImpl size={16} />
}

function SmartIconImpl({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-workspace"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8a7.5 7.5 0 0 0 3.5 6.09" />
    </svg>
  )
}

export function Accounts() {
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
            <Wallet size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Accounts
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

      <TotalAssetsOverview />

      <MyAccounts />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <AccountAllocation />
        </div>
        <div>
          <FinancialHealth />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <RecentAccountActivity />
        </div>
        <div>
          <QuickInsights />
        </div>
      </div>
    </motion.div>
  )
}
