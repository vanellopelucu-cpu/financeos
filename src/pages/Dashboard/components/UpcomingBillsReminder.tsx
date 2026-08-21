import { motion } from 'framer-motion'
import { ChevronRight, Plus, Trash2, Check, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { useNotificationStore } from '../../../app/store/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { cn, formatCurrencyFull, getDueDateLabel } from '../../../lib/utils'
import type { Bill } from '../../../lib/types'
import { AddBillModal } from './AddBillModal'
import { DeleteBillConfirmation } from './DeleteBillConfirmation'
import { BillPayConfirm } from './BillPayConfirm'
import { BillUnpayConfirm } from './BillUnpayConfirm'

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

const statusColors: Record<string, string> = {
  unpaid: 'bg-warning-500/10 text-warning-500 border-warning-500/30',
  paid: 'bg-success-500/10 text-success-500 border-success-500/30',
  overdue: 'bg-red-500/10 text-red-500 border-red-500/30',
}

export function UpcomingBillsReminder() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
   const { upcomingBills, addBill, deleteBill, payBill, unpayBill, fetchBills } = useDashboardStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showUnpayModal, setShowUnpayModal] = useState(false)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)
  const [payingBill, setPayingBill] = useState<Bill | null>(null)
  const [unpayingBill, setUnpayingBill] = useState<Bill | null>(null)

  const navigate = useNavigate()

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

  const handleDeleteConfirm = async (id: string) => {
    const result = await deleteBill(id)
    if (result.success) {
      setShowDeleteModal(false)
      setDeletingBill(null)
    } else {
      console.error('Failed to delete bill:', result.error)
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
    })
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
                'flex h-9 w-9 items-center justify-center rounded-lg bg-workspace/10 text-workspace transition-colors hover:bg-workspace/20'
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
               <div className="py-6 text-center">
                 <p className="text-sm text-text-secondary">
                   No upcoming bills.
                 </p>
               </div>
             ) : (
               sortedBills.slice(0, 3).map((bill) => {
                const isPaid = bill.status === 'paid'
                const isOverdue = bill.status === 'overdue'

                return (
                   <motion.div
                     key={bill.id}
                     variants={itemVariants}
                     className={cn(
                       'group flex items-center justify-between gap-2 border-b border-border/30 p-3 transition-all last:border-0 sm:p-4',
                       isPaid ? 'opacity-75' : ''
                     )}
                   >
                        <div className="flex items-center gap-2 sm:gap-3">
                       <div className={cn(
                         'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg shadow-soft sm:h-12 sm:w-12 sm:rounded-xl sm:text-2xl',
                         isPaid ? 'bg-success-500/10' : isOverdue ? 'bg-red-500/10' : 'bg-secondary'
                       )}>
                        {bill.icon || '📄'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-text">{bill.title}</p>
                          {isPaid && (
                            <Badge
                              className={cn('border', statusColors.paid)}
                            >
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-success-500"></span>
                                LUNAS
                              </span>
                            </Badge>
                          )}
                          {isOverdue && !isPaid && (
                            <Badge
                              className={cn('border', statusColors.overdue)}
                            >
                              TERLENDIR
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <span>{getDueDateLabel(bill.dueDate)}</span>
                          {isPaid && bill.paidDate && (
                            <>
                              <span>·</span>
                              <span>Dibayar: {formatPaidDate(bill.paidDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                       <div className="flex items-center gap-1 sm:gap-2">
                       <span className="text-right text-sm font-semibold text-text sm:text-base">
                         {formatCurrencyFull(bill.amount, currency.code)}
                       </span>

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
                        >
                          <RotateCw size={16} />
                        </motion.button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setDeletingBill(bill)
                          setShowDeleteModal(true)
                        }}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                        )}
                        aria-label={`Delete ${bill.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })
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
    </>
  )
}

