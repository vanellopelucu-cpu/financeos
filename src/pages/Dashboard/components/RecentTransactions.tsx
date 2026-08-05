import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull, getCategoryIcon } from '../../../lib/utils'

export function RecentTransactions() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions, searchQuery, setSearchQuery } = useDashboardStore()

  const filteredTransactions = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
                  'w-full rounded-xl border border-border bg-secondary px-10 py-2 text-sm text-text placeholder-text-tertiary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace focus:ring-offset-2'
                )}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <p className="text-sm text-text-secondary">
                        No transactions found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
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
          </div>

          <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
            <p className="text-sm text-text-secondary">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-text-secondary transition-all hover:bg-border'
                )}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-medium text-text">1 / 5</span>
              <button
                type="button"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-text-secondary transition-all hover:bg-border'
                )}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
