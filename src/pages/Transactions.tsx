import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Search,
  TrendingDown,
  TrendingUp,
  Trash2,
  Plus,
} from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { cn, formatCurrencyFull, getCategoryIcon } from '../lib/utils'
import type { Transaction } from '../lib/types'

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  Transportation: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  Shopping: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
  Entertainment: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  'Bills & Utilities': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  Healthcare: 'bg-red-500/10 text-red-500 border-red-500/30',
  Education: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
  Salary: 'bg-sri-500/10 text-sri-500 border-sri-500/30',
  Investment: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  Transfer: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  Subscription: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  Coffee: 'bg-amber-600/10 text-amber-600 border-amber-600/30',
  Groceries: 'bg-green-500/10 text-green-500 border-green-500/30',
}

const typeFilterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
]

const dateFilterOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'This Year' },
]

const itemsPerPageOptions = [5, 10, 20, 50]

export function Transactions() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { transactions } = useDashboardStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const allCategories = Array.from(
    new Set(transactions.map((t) => t.category))
  ).sort()

  const today = new Date()

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const { addTransaction, fetchTransactions, fetchAnalytics } = useDashboardStore()

  const filterByDate = (tx: Transaction): boolean => {
    if (dateFilter === 'all') return true
    const txDate = new Date(tx.date)
    const diffDays = Math.floor(
      (today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (dateFilter === 'today') return diffDays === 0
    if (dateFilter === 'week') return diffDays >= 0 && diffDays <= 7
    if (dateFilter === 'month') return diffDays >= 0 && diffDays <= 30
    if (dateFilter === 'year') return diffDays >= 0 && diffDays <= 365
    return true
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || tx.category === categoryFilter
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'income' && tx.amount >= 0) ||
      (typeFilter === 'expense' && tx.amount < 0)
    const matchesDate = filterByDate(tx)

    return matchesSearch && matchesCategory && matchesType && matchesDate
  })

  const totalIncome = filteredTransactions
    .filter((t) => t.amount >= 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const netChange = totalIncome + totalExpenses

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length)
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const diffDays = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setTypeFilter('all')
    setDateFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== 'all' ||
    typeFilter !== 'all' ||
    dateFilter !== 'all'

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Currency', 'Workspace']
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.description,
      tx.category,
      tx.amount >= 0 ? 'Income' : 'Expense',
      tx.amount,
      currency.code,
      currentWorkspace.name,
    ])
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((val) => {
            const escaped = String(val).replace(/"/g, '""')
            return `"${escaped}"`
          })
          .join(',')
      )
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions-${currentWorkspace.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
            <CreditCard size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Transactions
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddTransaction(true)}
          className={cn(
            'flex items-center gap-2 rounded-xl bg-workspace px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-workspace-hover'
          )}
        >
          <Plus size={16} />
          + Tambah Catatan
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card glass className="border-0 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sri-500/10 text-sri-500">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total Income
              </p>
              <p className="text-xl font-bold text-sri-500">
                {formatCurrencyFull(totalIncome, currency.code)}
              </p>
            </div>
          </div>
        </Card>

        <Card glass className="border-0 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <TrendingDown size={18} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Total Expenses
              </p>
              <p className="text-xl font-bold text-red-500">
                -{formatCurrencyFull(Math.abs(totalExpenses), currency.code)}
              </p>
            </div>
          </div>
        </Card>

        <Card glass className="border-0 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                netChange >= 0
                  ? 'bg-workspace/10 text-workspace'
                  : 'bg-red-500/10 text-red-500'
              )}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Net Change
              </p>
              <p
                className={cn(
                  'text-xl font-bold',
                  netChange >= 0 ? 'text-workspace' : 'text-red-500'
                )}
              >
                {netChange >= 0 ? '+' : '-'}
                {formatCurrencyFull(Math.abs(netChange), currency.code)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card glass elevated className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle>
              <span className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                Search & Filter
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
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

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={cn(
                  'w-full cursor-pointer rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace'
                )}
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={cn(
                  'w-full cursor-pointer rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace'
                )}
              >
                {typeFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={cn(
                  'w-full cursor-pointer rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace'
                )}
              >
                {dateFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-2">
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-secondary'
                    )}
                  >
                    <Trash2 size={14} />
                    Clear
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportToCSV}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl bg-workspace px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-workspace-hover'
                  )}
                >
                  <Download size={14} />
                  Export
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div variants={itemVariants}>
        <Card glass elevated className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>
                <span className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                  All Transactions
                </span>
              </CardTitle>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className={cn(
                  'cursor-pointer rounded-lg border border-border bg-secondary px-2 py-1 text-xs text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-workspace'
                )}
              >
                {itemsPerPageOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
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
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <p className="text-sm text-text-secondary">
                          No transactions found. Try adjusting your filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx, index) => {
                      const categoryClass =
                        categoryColors[tx.category] ||
                        'bg-secondary text-text-secondary border border-border'
                      const isIncome = tx.amount >= 0

                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.03,
                            ease: 'easeOut',
                          }}
                          whileHover={{
                            backgroundColor:
                              'hsl(var(--color-bg-secondary) / 0.5)',
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
                          <td className="px-6 py-4">
                            <Badge
                              className={cn(
                                'border',
                                categoryClass
                              )}
                            >
                              {tx.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={cn(
                                'font-semibold',
                                isIncome ? 'text-workspace' : 'text-red-500'
                              )}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrencyFull(
                                Math.abs(tx.amount),
                                currency.code
                              )}
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
              <p className="text-sm text-text-secondary">
                Showing {startIndex + 1}-{endIndex} of{' '}
                {filteredTransactions.length} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-text-secondary transition-all hover:bg-border disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all',
                          currentPage === page
                            ? 'bg-workspace text-white'
                            : 'text-text-secondary hover:bg-secondary'
                        )}
                      >
                        {page}
                      </button>
                    )
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-text-secondary transition-all hover:bg-border disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AddTransactionModal
        open={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSave={async (transaction) => {
          const result = await addTransaction(transaction)
          if (result.success) {
            setShowAddTransaction(false)
            await fetchTransactions()
            await fetchAnalytics()
          }
        }}
      />
    </motion.div>
  )
}
