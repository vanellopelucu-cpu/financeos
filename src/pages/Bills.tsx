import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { CreditCard, Edit, Plus, Trash2 } from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { cn, formatCurrencyFull, getDueDateLabel } from '../lib/utils'
import type { Bill } from '../lib/types'
import { AddBillModal } from './Dashboard/components/AddBillModal'
import { EditBillModal } from './Dashboard/components/EditBillModal'
import { DeleteBillConfirmation } from './Dashboard/components/DeleteBillConfirmation'

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

export function Bills() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { upcomingBills, addBill, editBill, deleteBill, fetchBills } =
    useDashboardStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

  const sortedBills = [...upcomingBills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
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
            'flex items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700'
          )}
        >
          <Plus size={16} />
          Add Bill
        </motion.button>
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
              <table className="w-full">
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
                  {sortedBills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="text-sm text-text-secondary">
                          No bills found.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedBills.map((bill) => {
                      const isIncome = bill.amount >= 0

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
                              <span className="font-medium text-text">
                                {bill.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {bill.category || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {getDueDateLabel(bill.dueDate)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={cn('border', statusColors[bill.status] || statusColors.unpaid)}
                            >
                              {bill.status}
                            </Badge>
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
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBill(bill)
                                  setShowEditModal(true)
                                }}
                                className={cn(
                                  'flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-secondary hover:text-text'
                                )}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingBill(bill)
                                  setShowDeleteModal(true)
                                }}
                                className={cn(
                                  'flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-500/10 hover:text-error-500'
                                )}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })
                  )}
                </tbody>
              </table>
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
    </motion.div>
  )
}
