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

function shouldShowBill(bill: Bill): boolean {
  if (bill.status === 'paid') {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(bill.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntilDue >= 0 && daysUntilDue <= 7
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

  const filteredBills = upcomingBills.filter(shouldShowBill)
  const sortedBills = [...filteredBills].sort(
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

  const handlePayConfirm = async (paidDate: string): Promise<{ success: boolean; error?: string }> => {
    if (!payingBill) return { success: false, error: 'No bill selected' }
    const result = await payBill(payingBill, paidDate)
    if (result.success) {
      setShowPayModal(false)
      setPayingBill(null)
    }
    return result
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
        className="h-full min-w-0"
      >
      <Card
        glass
        elevated
        className="h-full overflow-hidden border-0 p-0 shadow-xl"
      >
          <CardHeader className="border-b border-border/50 p-3 pb-3 sm:p-4 sm:pb-4 md:p-6 md:pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="shrink-0 text-xs font-medium uppercase tracking-wider text-text-secondary sm:text-sm">
                Upcoming Bills
              </CardTitle>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddModal(true)}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-workspace/10 text-workspace transition-colors hover:bg-workspace/20 sm:h-9 sm:w-9'
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
                 <div className="py-4 text-center sm:py-6">
                   <p className="text-xs text-text-secondary sm:text-sm">
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
                          'group flex min-w-0 items-center justify-between gap-2 border-b border-border/30 px-3 py-2 transition-all last:border-0 sm:px-4 sm:py-3 md:p-4',
                          isPaid ? 'opacity-75' : ''
                        )}
                      >
                          <div className="flex items-center gap-2 sm:gap-3">
                         <div className={cn(
                           'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm shadow-soft sm:h-9 sm:w-9 sm:text-lg md:h-12 md:w-12 md:rounded-xl md:text-2xl',
                           isPaid ? 'bg-success-500/10' : isOverdue ? 'bg-red-500/10' : 'bg-secondary'
                         )}>
                          {bill.icon || '📄'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <p className="truncate text-xs font-semibold text-text sm:text-sm md:text-base">{bill.title}</p>
                            {isPaid && (
                              <Badge
                                className={cn('border text-[7px] sm:text-[10px] md:text-xs', statusColors.paid)}
                              >
                                <span className="flex items-center gap-0.5 sm:gap-1">
                                  <span className="h-1 w-1 rounded-full bg-success-500 sm:h-1.5 sm:w-1.5"></span>
                                  LUNAS
                                </span>
                              </Badge>
                            )}
                            {isOverdue && !isPaid && (
                              <Badge
                                className={cn('border text-[7px] sm:text-[10px] md:text-xs', statusColors.overdue)}
                              >
                                TERLENDIR
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-text-secondary sm:gap-2 sm:text-xs md:text-sm">
                            <span>{getDueDateLabel(bill.dueDate)}</span>
                            {isPaid && bill.paidDate && (
                              <>
                                <span>·</span>
                                <span className="hidden sm:inline">Dibayar: {formatPaidDate(bill.paidDate)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                         <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-right text-xs font-semibold text-text sm:text-sm md:text-base">
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
                              'flex h-7 w-7 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20 sm:h-8 sm:w-8 md:h-9 md:w-9'
                            )}
                            aria-label={`Mark ${bill.title} as paid`}
                          >
                            <Check size={14} />
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
                              'flex h-7 w-7 items-center justify-center rounded-lg bg-warning-500/10 text-warning-500 transition-colors hover:bg-warning-500/20 sm:h-8 sm:w-8 md:h-9 md:w-9'
                            )}
                            aria-label={`Mark ${bill.title} as unpaid`}
                          >
                            <RotateCw size={14} />
                          </motion.button>
                        )}

                     <button
                       type="button"
                       onClick={() => {
                         setDeletingBill(bill)
                         setShowDeleteModal(true)
                       }}
                       className={cn(
                         'flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500 sm:h-8 sm:w-8 md:h-9 md:w-9'
                       )}
                       aria-label={`Delete ${bill.title}`}
                     >
                       <Trash2 size={14} />
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
                'flex w-full items-center justify-center gap-2 border-t border-border/50 py-3 text-xs font-medium text-workspace transition-colors hover:text-workspace-hover sm:py-4 sm:text-sm'
              )}
            >
              View All Bills
              <ChevronRight size={14} />
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
