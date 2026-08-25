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
       <Card glass elevated className="overflow-hidden border-0 shadow-xl">
        <CardHeader className="p-3 pb-3 sm:p-4 sm:pb-4 md:p-6 md:pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary sm:text-sm">
              Recent Transactions
            </CardTitle>
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary sm:h-4 sm:w-4"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                 className={cn(
                   'w-full rounded-lg border border-border bg-surface/50 pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-tertiary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace focus:ring-offset-2 sm:rounded-xl sm:pl-10 sm:py-2 sm:text-sm'
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
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary sm:px-4 sm:py-3 sm:text-xs md:px-6">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary sm:px-4 sm:py-3 sm:text-xs md:px-6">
                    Category
                  </th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary sm:table-cell sm:px-4 sm:py-3 sm:text-xs md:px-6">
                    Date
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary sm:px-4 sm:py-3 sm:text-xs md:px-6">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center sm:py-12">
                      <p className="text-xs text-text-secondary sm:text-sm">
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
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xs sm:h-9 sm:w-9 sm:text-base md:text-lg">
                            {tx.icon || getCategoryIcon(tx.category)}
                          </div>
                          <span className="text-xs font-medium text-text sm:text-sm md:text-base">
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[10px] text-text-secondary sm:px-4 sm:py-3 sm:text-xs md:px-6">
                        {tx.category}
                      </td>
                      <td className="hidden px-3 py-2 text-[10px] text-text-secondary sm:table-cell sm:px-4 sm:py-3 sm:text-xs md:px-6">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-3 py-2 text-right sm:px-4 sm:py-3 md:px-6">
                        <span
                          className={cn(
                            'text-xs font-semibold sm:text-sm md:text-base',
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
            <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-3 sm:hidden md:space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="py-4 text-center sm:py-6">
                  <p className="text-[10px] text-text-secondary sm:text-xs">No transactions found</p>
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
                     className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 px-3 py-2 sm:px-4 sm:py-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xs sm:h-8 sm:w-8 sm:text-sm md:h-10 md:w-10 md:text-base">
                        {tx.icon || getCategoryIcon(tx.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[10px] font-medium text-text sm:text-xs md:text-sm">
                          {tx.description}
                        </span>
                        <span className="block text-[8px] text-text-secondary sm:text-[10px] md:text-xs">
                          {tx.category}
                        </span>
                        <p className="text-[8px] text-text-tertiary hidden sm:block md:hidden">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'ml-2 flex-shrink-0 text-[10px] font-semibold sm:text-xs md:text-sm',
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
              className="border-t border-border/50 px-3 py-3 sm:px-4 sm:py-4 md:px-6"
            >
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className={cn(
                  'flex items-center gap-2 text-[10px] font-medium text-workspace hover:underline sm:text-xs md:text-sm'
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
