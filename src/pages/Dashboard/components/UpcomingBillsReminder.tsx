import { motion } from 'framer-motion'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull, getDueDateLabel } from '../../../lib/utils'
import type { Bill } from '../../../lib/types'
import { AddBillModal } from './AddBillModal'
import { DeleteBillConfirmation } from './DeleteBillConfirmation'

const BILL_CATEGORIES = [
  'Bills & Utilities',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
]

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export function UpcomingBillsReminder() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { upcomingBills, addBill, deleteBill, fetchBills } = useDashboardStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

   const sortedBills = [...upcomingBills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )
  const navigate = useNavigate()

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

  const handleDeleteConfirm = async (id: string) => {
    const result = await deleteBill(id)
    if (result.success) {
      setShowDeleteModal(false)
      setDeletingBill(null)
    } else {
      console.error('Failed to delete bill:', result.error)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full"
      >
      <Card
        glass
        elevated
        className="h-full border-0 p-0 shadow-xl"
      >
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Upcoming Bills
            </CardTitle>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace transition-colors hover:bg-workspace/20'
              )}
              aria-label="Add bill"
            >
              <Plus size={16} />
            </motion.button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <motion.div
            className="flex flex-col"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {sortedBills.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-text-secondary">
                  No upcoming bills.
                </p>
              </div>
            ) : (
              sortedBills.map((bill) => (
                <motion.div
                  key={bill.id}
                  variants={itemVariants}
                  whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                  className={cn(
                    'group flex items-center justify-between border-b border-border/30 p-4 transition-all last:border-0'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl shadow-soft">
                      {bill.icon || '📄'}
                    </div>
                    <div>
                      <p className="font-semibold text-text">{bill.title}</p>
                      <p className="text-sm text-text-secondary">
                        {getDueDateLabel(bill.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-right font-semibold text-text">
                      {formatCurrencyFull(bill.amount, currency.code)}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-text-tertiary transition-transform group-hover:translate-x-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingBill(bill)
                        setShowDeleteModal(true)
                      }}
                      className={cn(
                        'opacity-0 group-hover:opacity-100 rounded-lg p-1 text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                      )}
                      aria-label={`Delete ${bill.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/bills')}
            className={cn(
              'flex w-full items-center justify-center gap-2 border-t border-border/50 py-4 text-sm font-medium text-workspace transition-colors hover:text-workspace-hover'
            )}
          >
            View All Bills
            <ChevronRight size={16} />
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>

    <AddBillModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      onSave={handleAddSave}
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
    </>
  )
}
