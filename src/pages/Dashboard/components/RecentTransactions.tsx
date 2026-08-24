import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull, getCategoryIcon } from '../../../lib/utils'

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export function RecentTransactions() {
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions, searchQuery, setSearchQuery } = useDashboardStore()

  const filtered = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const recentTransactions = sorted.slice(0, 5)
  const hasMore = sorted.length > 5

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="w-full"
    >
      <Card glass elevated className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Recent Transactions
            </CardTitle>
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                 className={cn(
                  'w-full rounded-xl border border-border bg-surface/50 px-10 py-2 text-sm text-text placeholder:text-text-tertiary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace focus:ring-offset-2'
                )}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="hidden w-full sm:table">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <p className="text-sm text-text-secondary">
                        No transactions found
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx, index) => (
                    <motion.tr
                      key={tx.id}
                      variants={itemVariants}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.03,
                        ease: 'easeOut',
                      }}
                      whileHover={{
                        backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)',
                      }}
                      className="border-b border-border/30 transition-colors last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                            {tx.icon || getCategoryIcon(tx.category)}
                          </div>
                          <span className="font-medium text-text">
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {tx.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            'font-semibold',
                            tx.amount >= 0 ? 'text-workspace' : 'text-red-500'
                          )}
                        >
                          {tx.amount >= 0 ? '+' : '-'}
                          {formatCurrencyFull(Math.abs(tx.amount), currency.code)}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card List */}
            <div className="space-y-3 sm:hidden">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-text-secondary">No transactions found</p>
                </div>
              ) : (
                recentTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.03,
                      ease: 'easeOut',
                    }}
                     className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-base sm:h-10 sm:w-10 sm:text-lg">
                        {tx.icon || getCategoryIcon(tx.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-text block text-sm sm:text-base truncate">
                          {tx.description}
                        </span>
                        <span className="text-xs text-text-secondary block">
                          {tx.category}
                        </span>
                        <p className="text-xs text-text-tertiary hidden sm:block">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-semibold sm:text-lg flex-shrink-0 ml-2',
                        tx.amount >= 0 ? 'text-workspace' : 'text-red-500'
                      )}
                    >
                      {tx.amount >= 0 ? '+' : '-'}
                      {formatCurrencyFull(Math.abs(tx.amount), currency.code)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              className="border-t border-border/50 px-4 py-4 sm:px-6"
            >
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium text-workspace hover:underline'
                )}
              >
                Lihat Semua
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
