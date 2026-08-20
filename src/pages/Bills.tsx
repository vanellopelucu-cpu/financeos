import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, CreditCard, Edit, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { useNotificationStore } from '../app/store/notifications'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { cn, formatCurrencyFull, getDueDateLabel } from '../lib/utils'
import type { Bill } from '../lib/types'
import { AddBillModal } from './Dashboard/components/AddBillModal'
import { EditBillModal } from './Dashboard/components/EditBillModal'
import { DeleteBillConfirmation } from './Dashboard/components/DeleteBillConfirmation'
import { BillPayConfirm } from './Dashboard/components/BillPayConfirm'
import { BillUnpayConfirm } from './Dashboard/components/BillUnpayConfirm'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const statusColors: Record<string, string> = {
  unpaid: 'bg-warning-500/10 text-warning-500 border-warning-500/30',
  paid: 'bg-success-500/10 text-success-500 border-success-500/30',
  overdue: 'bg-red-500/10 text-red-500 border-red-500/30',
}

const BILL_CATEGORIES = [
  'Bills & Utilities',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
]

const FILTER_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'unpaid', label: 'Belum Dibayar' },
  { id: 'paid', label: 'Lunas' },
  { id: 'overdue', label: 'Terlambat' },
] as const

type FilterType = typeof FILTER_TABS[number]['id']

export function Bills() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
   const { upcomingBills, addBill, editBill, deleteBill, payBill, unpayBill, fetchBills } =
    useDashboardStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showUnpayModal, setShowUnpayModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)
  const [payingBill, setPayingBill] = useState<Bill | null>(null)
  const [unpayingBill, setUnpayingBill] = useState<Bill | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const sortedBills = [...upcomingBills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  const filteredBills = sortedBills.filter((bill) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unpaid') return bill.status === 'unpaid' || bill.status === 'overdue'
    if (activeFilter === 'paid') return bill.status === 'paid'
    if (activeFilter === 'overdue') return bill.status === 'overdue'
    return true
  })

  const handleAddSave = async (bill: Omit<Bill, 'id' | 'status'> & {
    recurring: boolean
    category: string
  }) => {
    const result = await addBill({
      ...bill,
      status: 'unpaid',
    })
    if (result.success) {
      setShowAddModal(false)
      await fetchBills()
    }
  }

  const handleEditSave = async (id: string, bill: Partial<Omit<Bill, 'id'>>) => {
    const result = await editBill(id, bill)
    if (result.success) {
      setShowEditModal(false)
      setEditingBill(null)
      await fetchBills()
    }
  }

  const handleDeleteConfirm = async (id: string) => {
    const result = await deleteBill(id)
    if (result.success) {
      setShowDeleteModal(false)
      setDeletingBill(null)
      await fetchBills()
    }
  }

   const handlePayConfirm = async (paidDate: string) => {
    if (!payingBill) return
    const result = await payBill(payingBill, paidDate)
    if (result.success) {
      setShowPayModal(false)
      setPayingBill(null)
    } else {
      useNotificationStore.getState().addNotification({
        type: 'bill',
        title: 'Gagal Membayar Tagihan',
        description: result.error || 'Gagal membayar tagihan. Silakan coba lagi.',
        priority: 'high',
        read: false,
        icon: '💡',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleUnpayConfirm = async () => {
    if (!unpayingBill) return
    const result = await unpayBill(unpayingBill)
    if (result.success) {
      setShowUnpayModal(false)
      setUnpayingBill(null)
    } else {
      useNotificationStore.getState().addNotification({
        type: 'bill',
        title: 'Gagal Membatalkan Pembayaran',
        description: result.error || 'Gagal membatalkan pembayaran. Silakan coba lagi.',
        priority: 'high',
        read: false,
        icon: '💡',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const formatPaidDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
            <CreditCard size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Bills
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className={cn(
            'w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700'
          )}
        >
          <Plus size={16} />
          Add Bill
        </motion.button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex overflow-x-auto"
      >
        <div className="flex gap-1 rounded-xl bg-secondary/50 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeFilter === tab.id
                  ? 'bg-workspace text-white shadow-md'
                  : 'text-text-secondary hover:text-text hover:bg-border'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card glass elevated className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              All Bills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="hidden w-full sm:table">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Bill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="text-sm text-text-secondary">
                          No bills found.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => {
                      const isIncome = bill.amount >= 0
                      const isPaid = bill.status === 'paid'
                      const isOverdue = bill.status === 'overdue'

                      return (
                        <motion.tr
                          key={bill.id}
                          variants={itemVariants}
                          whileHover={{
                            backgroundColor:
                              'hsl(var(--color-bg-secondary) / 0.5)',
                          }}
                          className="border-b border-border/30 transition-colors last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                                {bill.icon || '📄'}
                              </div>
                              <div>
                                <span className="font-medium text-text">
                                  {bill.title}
                                </span>
                                {isPaid && bill.paidDate && (
                                  <p className="text-xs text-text-tertiary">
                                    Dibayar: {formatPaidDate(bill.paidDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {bill.category || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            <div className="flex flex-col">
                              <span>{getDueDateLabel(bill.dueDate)}</span>
                              {isOverdue && !isPaid && (
                                <span className="text-xs text-red-500 font-medium">
                                  Jatuh tempo lewat
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn('border', statusColors[bill.status] || statusColors.unpaid)}
                              >
                                {bill.status === 'paid' ? 'LUNAS' : bill.status === 'overdue' ? 'TERLAMBAT' : 'BELUM DIBAYAR'}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={cn(
                                'font-semibold',
                                isIncome ? 'text-sri-500' : 'text-red-500'
                              )}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrencyFull(Math.abs(bill.amount), currency.code)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!isPaid && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setPayingBill(bill)
                                    setShowPayModal(true)
                                  }}
                                  className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20'
                                  )}
                                  aria-label={`Mark ${bill.title} as paid`}
                                  title="Tandai Dibayar"
                                 >
                                  <Check size={16} />
                                </motion.button>
                              )}
                              {isPaid && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setUnpayingBill(bill)
                                    setShowUnpayModal(true)
                                  }}
                                  className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg bg-warning-500/10 text-warning-500 transition-colors hover:bg-warning-500/20'
                                  )}
                                  aria-label={`Mark ${bill.title} as unpaid`}
                                  title="Tandai Belum Dibayar"
                                 >
                                  <RotateCw size={16} />
                                </motion.button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBill(bill)
                                  setShowEditModal(true)
                                }}
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-secondary hover:text-text'
                                )}
                                aria-label={`Edit ${bill.title}`}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingBill(bill)
                                  setShowDeleteModal(true)
                                }}
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-500/10 hover:text-error-500'
                                )}
                                aria-label={`Delete ${bill.title}`}
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })
                  )}
                </tbody>
              </table>

              {/* Mobile Card List */}
              <div className="space-y-3 sm:hidden">
                {filteredBills.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-text-secondary">
                      No bills found.
                    </p>
                  </div>
                ) : (
                  filteredBills.map((bill) => {
                    const isIncome = bill.amount >= 0
                    const isPaid = bill.status === 'paid'
                    const isOverdue = bill.status === 'overdue'
                    const statusConfig = statusColors[bill.status] || statusColors.unpaid

                    return (
                      <motion.div
                        key={bill.id}
                        layoutId={bill.id}
                        className="rounded-xl border border-border/50 bg-secondary/30 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                              {bill.icon || '📄'}
                            </div>
                            <div>
                              <p className="font-semibold text-text">{bill.title}</p>
                              <p className="text-sm text-text-secondary">{bill.category || 'Uncategorized'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={cn('border', statusConfig)}>
                                  {bill.status === 'paid' ? 'LUNAS' : bill.status === 'overdue' ? 'TERLAMBAT' : 'BELUM DIBAYAR'}
                                </Badge>
                                {isOverdue && !isPaid && (
                                  <span className="text-xs text-red-500 font-medium">Jatuh tempo lewat</span>
                                )}
                              </div>
                              <p className="text-xs text-text-tertiary mt-1">{getDueDateLabel(bill.dueDate)}</p>
                            </div>
                          </div>
                          <span className={cn(
                            'text-right font-semibold',
                            isIncome ? 'text-sri-500' : 'text-red-500'
                          )}>
                            {isIncome ? '+' : '-'}
                            {formatCurrencyFull(Math.abs(bill.amount), currency.code)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/30 pt-3">
                          {!isPaid && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setPayingBill(bill)
                                setShowPayModal(true)
                              }}
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20'
                              )}
                              aria-label={`Mark ${bill.title} as paid`}
                              title="Bayar"
                            >
                              <Check size={16} />
                            </motion.button>
                          )}
                          {isPaid && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setUnpayingBill(bill)
                                setShowUnpayModal(true)
                              }}
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg bg-warning-500/10 text-warning-500 transition-colors hover:bg-warning-500/20'
                              )}
                              aria-label={`Mark ${bill.title} as unpaid`}
                              title="Tandai Belum Dibayar"
                            >
                              <RotateCw size={16} />
                            </motion.button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBill(bill)
                              setShowEditModal(true)
                            }}
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-secondary hover:text-text'
                            )}
                            aria-label={`Edit ${bill.title}`}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingBill(bill)
                              setShowDeleteModal(true)
                            }}
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-500/10 hover:text-error-500'
                            )}
                            aria-label={`Delete ${bill.title}`}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AddBillModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSave}
        categories={BILL_CATEGORIES}
      />

      <EditBillModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingBill(null)
        }}
        bill={editingBill}
        onSave={handleEditSave}
        categories={BILL_CATEGORIES}
      />

      <DeleteBillConfirmation
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingBill(null)
        }}
        bill={deletingBill}
        onConfirm={handleDeleteConfirm}
      />

      <BillPayConfirm
        open={showPayModal}
        onClose={() => {
          setShowPayModal(false)
          setPayingBill(null)
        }}
        bill={payingBill}
        currency={currency.code}
        onConfirm={handlePayConfirm}
      />

      <BillUnpayConfirm
        open={showUnpayModal}
        onClose={() => {
          setShowUnpayModal(false)
          setUnpayingBill(null)
        }}
        bill={unpayingBill}
        currency={currency.code}
        onConfirm={handleUnpayConfirm}
      />
    </motion.div>
  )
}
