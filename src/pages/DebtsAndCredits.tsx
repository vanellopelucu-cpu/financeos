import { motion, type Variants } from 'framer-motion'
import { Edit, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
import { useNotificationStore } from '../app/store/notifications'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { cn, formatCurrencyFull } from '../lib/utils'
import type { Debt, Credit, DebtPayment, CreditReceipt } from '../lib/types'
import { AddDebtModal } from './Dashboard/components/AddDebtModal'
import { AddCreditModal } from './Dashboard/components/AddCreditModal'
import { DebtPaymentModal } from './Dashboard/components/DebtPaymentModal'
import { CreditReceiptModal } from './Dashboard/components/CreditReceiptModal'
import { DeleteDebtConfirmation } from './Dashboard/components/DeleteDebtConfirmation'
import { DeleteCreditConfirmation } from './Dashboard/components/DeleteCreditConfirmation'

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

const DEBT_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  unpaid: { label: 'Belum Lunas', badgeClass: 'bg-warning-500/10 text-warning-500 border-warning-500/30' },
  partial: { label: 'Sebagian', badgeClass: 'bg-warning-500/10 text-warning-400 border-warning-500/30' },
  paid: { label: 'Lunas', badgeClass: 'bg-success-500/10 text-success-500 border-success-500/30' },
}

const CREDIT_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  unreceived: { label: 'Belum Diterima', badgeClass: 'bg-warning-500/10 text-warning-500 border-warning-500/30' },
  partial: { label: 'Sebagian', badgeClass: 'bg-warning-500/10 text-warning-400 border-warning-500/30' },
  received: { label: 'Lunas', badgeClass: 'bg-success-500/10 text-success-500 border-success-500/30' },
}

type TabType = 'debts' | 'credits'

const DEBT_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'unpaid', label: 'Belum Lunas' },
  { id: 'partial', label: 'Sebagian' },
  { id: 'paid', label: 'Lunas' },
] as const

const CREDIT_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'unreceived', label: 'Belum Diterima' },
  { id: 'partial', label: 'Sebagian' },
  { id: 'received', label: 'Lunas' },
] as const

type DebtFilterType = typeof DEBT_FILTERS[number]['id']
type CreditFilterType = typeof CREDIT_FILTERS[number]['id']

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DebtsAndCredits() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const {
    debts = [],
    credits = [],
    balance,
    addDebt,
    editDebt,
    deleteDebt,
    payDebt,
    addCredit,
    editCredit,
    deleteCredit,
    receiveCredit,
    fetchDebts,
    fetchCredits,
    fetchTransactions,
    fetchAnalytics,
  } = useDashboardStore()

  const [activeTab, setActiveTab] = useState<TabType>('debts')
  const [debtFilter, setDebtFilter] = useState<DebtFilterType>('all')
  const [creditFilter, setCreditFilter] = useState<CreditFilterType>('all')

  const [showAddDebtModal, setShowAddDebtModal] = useState(false)
  const [showEditDebtModal, setShowEditDebtModal] = useState(false)
  const [showDeleteDebtModal, setShowDeleteDebtModal] = useState(false)
  const [showPayDebtModal, setShowPayDebtModal] = useState(false)
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)

  const [showAddCreditModal, setShowAddCreditModal] = useState(false)
  const [showEditCreditModal, setShowEditCreditModal] = useState(false)
  const [showDeleteCreditModal, setShowDeleteCreditModal] = useState(false)
  const [showReceiveCreditModal, setShowReceiveCreditModal] = useState(false)
  const [deletingCredit, setDeletingCredit] = useState<Credit | null>(null)
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null)
  const [receivingCredit, setReceivingCredit] = useState<Credit | null>(null)

  const [expandedDebts, setExpandedDebts] = useState<Set<string>>(new Set())

  const availableBalance = balance.availableBalance

  const handleAddDebtSave = async (id: string | null, debt: Partial<Omit<Debt, 'id' | 'payments' | 'status' | 'remainingAmount'>>) => {
    if (!debt.amount) return
    if (id) {
      const result = await editDebt(id, debt)
      if (result.success) {
        setShowEditDebtModal(false)
        setEditingDebt(null)
        await fetchDebts()
      } else {
        useNotificationStore.getState().addNotification({
          type: 'system',
          title: 'Gagal Menyimpan Hutang',
          description: result.error || 'Gagal menyimpan hutang.',
          priority: 'high',
          read: false,
          icon: '🧾',
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      const result = await addDebt({
        creditorName: debt.creditorName || '',
        amount: debt.amount,
        remainingAmount: debt.amount,
        status: 'unpaid' as const,
        note: debt.note,
        icon: debt.icon,
      })
      if (result.success) {
        setShowAddDebtModal(false)
        await fetchDebts()
      } else {
        useNotificationStore.getState().addNotification({
          type: 'system',
          title: 'Gagal Menambah Hutang',
          description: result.error || 'Gagal menambah hutang.',
          priority: 'high',
          read: false,
          icon: '🧾',
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  const handleDeleteDebtConfirm = async () => {
    if (!deletingDebt) return
    const result = await deleteDebt(deletingDebt.id)
    if (result.success) {
      setShowDeleteDebtModal(false)
      setDeletingDebt(null)
      await fetchDebts()
    } else {
      useNotificationStore.getState().addNotification({
        type: 'system',
        title: 'Gagal Menghapus Hutang',
        description: result.error || 'Gagal menghapus hutang.',
        priority: 'high',
        read: false,
        icon: '🧾',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handlePayDebtConfirm = async (amount: number, paymentDate: string, note?: string) => {
    if (!payingDebt) return { success: false, error: 'No debt selected' }
    const result = await payDebt(payingDebt, amount, paymentDate, note)
    if (result.success) {
      setShowPayDebtModal(false)
      setPayingDebt(null)
      await fetchDebts()
      await fetchTransactions()
      await fetchAnalytics()
    } else {
      useNotificationStore.getState().addNotification({
        type: 'system',
        title: 'Gagal Membayar Hutang',
        description: result.error || 'Gagal membayar hutang.',
        priority: 'high',
        read: false,
        icon: '🧾',
        timestamp: new Date().toISOString(),
      })
    }
    return result
  }

  const handleAddCreditSave = async (id: string | null, credit: Partial<Omit<Credit, 'id' | 'receipts' | 'status' | 'remainingAmount'>>) => {
    if (!credit.amount) return
    if (id) {
      const result = await editCredit(id, credit)
      if (result.success) {
        setShowEditCreditModal(false)
        setEditingCredit(null)
        await fetchCredits()
      } else {
        useNotificationStore.getState().addNotification({
          type: 'system',
          title: 'Gagal Menyimpan Piutang',
          description: result.error || 'Gagal menyimpan piutang.',
          priority: 'high',
          read: false,
          icon: '💰',
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      const result = await addCredit({
        debtorName: credit.debtorName || '',
        amount: credit.amount,
        remainingAmount: credit.amount,
        status: 'unreceived' as const,
        note: credit.note,
        icon: credit.icon,
      })
      if (result.success) {
        setShowAddCreditModal(false)
        await fetchCredits()
      } else {
        useNotificationStore.getState().addNotification({
          type: 'system',
          title: 'Gagal Menambah Piutang',
          description: result.error || 'Gagal menambah piutang.',
          priority: 'high',
          read: false,
          icon: '💰',
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  const handleDeleteCreditConfirm = async () => {
    if (!deletingCredit) return
    const result = await deleteCredit(deletingCredit.id)
    if (result.success) {
      setShowDeleteCreditModal(false)
      setDeletingCredit(null)
      await fetchCredits()
    } else {
      useNotificationStore.getState().addNotification({
        type: 'system',
        title: 'Gagal Menghapus Piutang',
        description: result.error || 'Gagal menghapus piutang.',
        priority: 'high',
        read: false,
        icon: '💰',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleReceiveCreditConfirm = async (amount: number, receiptDate: string, note?: string) => {
    if (!receivingCredit) return { success: false, error: 'No credit selected' }
    const result = await receiveCredit(receivingCredit, amount, receiptDate, note)
    if (result.success) {
      setShowReceiveCreditModal(false)
      setReceivingCredit(null)
      await fetchCredits()
      await fetchTransactions()
      await fetchAnalytics()
    } else {
      useNotificationStore.getState().addNotification({
        type: 'system',
        title: 'Gagal Menerima Piutang',
        description: result.error || 'Gagal menerima piutang.',
        priority: 'high',
        read: false,
        icon: '💰',
        timestamp: new Date().toISOString(),
      })
    }
    return result
  }

  const toggleDebtExpanded = (id: string) => {
    setExpandedDebts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredDebts = [...debts].filter((d) => {
    if (debtFilter === 'all') return true
    return d.status === debtFilter
  }).sort((a, b) => b.amount - a.amount)

  const filteredCredits = [...credits].filter((c) => {
    if (creditFilter === 'all') return true
    return c.status === creditFilter
  }).sort((a, b) => b.amount - a.amount)

  const formatPaymentDate = (d: DebtPayment) => formatDate(d.paymentDate)
  const formatReceiptDate = (r: CreditReceipt) => formatDate(r.receiptDate)

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
            <span className="text-lg">💰</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Hutang & Piutang</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (activeTab === 'debts') setShowAddDebtModal(true)
            else setShowAddCreditModal(true)
          }}
          className={cn(
            'w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 sm:gap-2'
          )}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">
             {activeTab === 'debts' ? 'Add Hutang' : 'Tambah Piutang'}
          </span>
          <span className="sm:hidden">+</span>
        </motion.button>
      </motion.div>

       <motion.div variants={itemVariants} className="flex gap-1 overflow-x-auto rounded-xl bg-secondary/50 p-1">
         <button
           type="button"
           onClick={() => {
             setActiveTab('debts')
             setDebtFilter('all')
           }}
           className={cn(
             'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all',
             activeTab === 'debts'
               ? 'bg-workspace text-white shadow-md'
               : 'text-text-secondary hover:text-text hover:bg-border'
           )}
         >
           Hutang
         </button>
         <button
           type="button"
           onClick={() => {
             setActiveTab('credits')
             setCreditFilter('all')
           }}
           className={cn(
             'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all',
             activeTab === 'credits'
               ? 'bg-workspace text-white shadow-md'
               : 'text-text-secondary hover:text-text hover:bg-border'
           )}
         >
           Piutang
         </button>
       </motion.div>

      {activeTab === 'debts' ? (
        <>
          <motion.div variants={itemVariants} className="flex gap-1 overflow-x-auto rounded-xl bg-secondary/50 p-1">
            {DEBT_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDebtFilter(f.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                  debtFilter === f.id
                    ? 'bg-workspace text-white shadow-md'
                    : 'text-text-secondary hover:text-text hover:bg-border'
                )}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card glass elevated className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                  Daftar Hutang ({filteredDebts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {filteredDebts.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-text-secondary">Tidak ada hutang ditemukan.</p>
                    </div>
                  ) : (
                    <>
                     <table className="hidden w-full sm:table">
                       <thead>
                         <tr className="border-b border-border/50">
                           <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">Kreditor</th>
                           <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                           <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">Total</th>
                           <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">Sisa</th>
                           <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">Aksi</th>
                         </tr>
                       </thead>
                      <tbody>
                        {filteredDebts.map((debt) => {
                          const isPaid = debt.status === 'paid'
                          const statusConfig = DEBT_STATUS_LABELS[debt.status] || DEBT_STATUS_LABELS.unpaid
                          const isExpanded = expandedDebts.has(debt.id)

                          return (
                            <motion.tr
                              key={debt.id}
                              variants={itemVariants}
                              whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                              className="border-b border-border/30 transition-colors last:border-0"
                            >
                                <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                   <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                                     {debt.icon || '🧾'}
                                   </div>
                                   <div>
                                     <span className="font-medium text-text">{debt.creditorName}</span>
                                     {debt.note && (
                                       <p className="text-xs text-text-tertiary">{debt.note}</p>
                                     )}
                                   </div>
                                 </div>
                               </td>
                               <td className="px-6 py-4">
                                <Badge className={cn('border', statusConfig.badgeClass)}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-semibold text-text">
                                  {formatCurrencyFull(debt.amount, currency.code)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={cn('font-semibold', debt.remainingAmount > 0 ? 'text-red-500' : 'text-text-tertiary')}>
                                  {formatCurrencyFull(debt.remainingAmount, currency.code)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {!isPaid && debt.remainingAmount > 0 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => {
                                        setPayingDebt(debt)
                                        setShowPayDebtModal(true)
                                      }}
                                      className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20'
                                   )}
                                   aria-label={`Pay debt ${debt.creditorName}`}
                                   title="Bayar"
                                 >
                                   <Plus size={16} />
                                    </motion.button>
                                  )}
                                  {debt.payments && debt.payments.length > 0 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => toggleDebtExpanded(debt.id)}
                                      className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                   )}
                                   aria-label={`Toggle payment history for ${debt.creditorName}`}
                                   title="Riwayat"
                                 >
                                   {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </motion.button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingDebt(debt)
                                      setShowEditDebtModal(true)
                                    }}
                                    className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                   )}
                                   aria-label={`Edit ${debt.creditorName}`}
                                   title="Edit"
                                 >
                                   <Edit size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletingDebt(debt)
                                      setShowDeleteDebtModal(true)
                                    }}
                                    className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                                   )}
                                   aria-label={`Delete ${debt.creditorName}`}
                                   title="Hapus"
                                 >
                                   <Trash2 size={16} />
                                  </button>
                            </div>
                          </td>
                        </motion.tr>
                      )})}

                      {filteredDebts.map((debt) => {
                         const isExpanded = expandedDebts.has(debt.id)
                         if (!isExpanded || (debt.payments || []).length === 0) return null
                          return (
                            <tr key={`expand-${debt.id}`} className="border-b border-border/20">
                              <td colSpan={5} className="px-6 py-3">
                               <div className="ml-12 space-y-2">
                                 <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                                   Riwayat Pembayaran
                                 </p>
                                 {debt.payments.map((p) => (
                                   <div
                                     key={p.id}
                                     className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2"
                                   >
                                     <div>
                                       <span className="text-sm font-medium text-text">
                                         {formatCurrencyFull(p.amount, currency.code)}
                                       </span>
                                       <p className="text-xs text-text-tertiary">{formatPaymentDate(p)}</p>
                                     </div>
                                     {p.note && <span className="text-xs text-text-secondary">{p.note}</span>}
                                   </div>
                                 ))}
                               </div>
                             </td>
                           </tr>
                         )
                       })}
                       </tbody>
                     </table>

                     {/* Mobile Debt Cards */}
                     <div className="space-y-3 sm:hidden">
                       {filteredDebts.map((debt) => {
                         const isPaid = debt.status === 'paid'
                         const statusConfig = DEBT_STATUS_LABELS[debt.status] || DEBT_STATUS_LABELS.unpaid
                         const isExpandedDebt = expandedDebts.has(debt.id)

                         return (
                           <motion.div
                             key={debt.id}
                             className="rounded-xl border border-border/50 bg-secondary/30 p-4"
                           >
                             <div className="flex items-center gap-3">
                               <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                                 {debt.icon || '🧾'}
                               </div>
                                <div className="flex-1">
                                  <span className="font-medium text-text">{debt.creditorName}</span>
                                  {debt.note && (
                                    <p className="text-xs text-text-tertiary">{debt.note}</p>
                                  )}
                                  <Badge className={cn('border mt-1', statusConfig.badgeClass)}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                               <div className="text-right">
                                 <p className="text-xs text-text-tertiary">Total</p>
                                 <p className="font-semibold text-text">{formatCurrencyFull(debt.amount, currency.code)}</p>
                                 <p className="text-xs text-text-tertiary">Sisa</p>
                                 <p className={cn(
                                   'font-semibold',
                                   debt.remainingAmount > 0 ? 'text-red-500' : 'text-text-tertiary'
                                 )}>
                                   {formatCurrencyFull(debt.remainingAmount, currency.code)}
                                 </p>
                               </div>
                             </div>
                             <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/30 pt-3">
                               {!isPaid && debt.remainingAmount > 0 && (
                                 <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => {
                                     setPayingDebt(debt)
                                     setShowPayDebtModal(true)
                                   }}
                                   className={cn(
                                     'flex h-9 w-9 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20'
                                   )}
                                   aria-label={`Pay debt ${debt.creditorName}`}
                                   title="Bayar"
                                 >
                                   <Plus size={16} />
                                 </motion.button>
                               )}
                               {debt.payments && debt.payments.length > 0 && (
                                 <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => toggleDebtExpanded(debt.id)}
                                   className={cn(
                                     'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                   )}
                                   aria-label={`Toggle payment history`}
                                   title="Riwayat"
                                 >
                                   {isExpandedDebt ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                 </motion.button>
                               )}
                               <button
                                 type="button"
                                 onClick={() => {
                                   setEditingDebt(debt)
                                   setShowEditDebtModal(true)
                                 }}
                                 className={cn(
                                   'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                 )}
                                 aria-label={`Edit ${debt.creditorName}`}
                                 title="Edit"
                               >
                                 <Edit size={16} />
                               </button>
                               <button
                                 type="button"
                                 onClick={() => {
                                   setDeletingDebt(debt)
                                   setShowDeleteDebtModal(true)
                                 }}
                                 className={cn(
                                   'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                                 )}
                                 aria-label={`Delete ${debt.creditorName}`}
                                 title="Hapus"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                             {isExpandedDebt && (debt.payments || []).length > 0 && (
                               <div className="mt-3 space-y-2">
                                 <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                                   Riwayat Pembayaran
                                 </p>
                                 {debt.payments.map((p) => (
                                   <div
                                     key={p.id}
                                     className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2"
                                   >
                                     <div>
                                       <span className="text-sm font-medium text-text">
                                         {formatCurrencyFull(p.amount, currency.code)}
                                       </span>
                                       <p className="text-xs text-text-tertiary">{formatPaymentDate(p)}</p>
                                     </div>
                                     {p.note && <span className="text-xs text-text-secondary">{p.note}</span>}
                                   </div>
                                 ))}
                               </div>
                             )}
                           </motion.div>
                         )
                       })}
                     </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={itemVariants} className="flex gap-1 overflow-x-auto rounded-xl bg-secondary/50 p-1">
            {CREDIT_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCreditFilter(f.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                  creditFilter === f.id
                    ? 'bg-workspace text-white shadow-md'
                    : 'text-text-secondary hover:text-text hover:bg-border'
                )}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card glass elevated className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
                  Daftar Piutang ({filteredCredits.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {filteredCredits.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-text-secondary">Tidak ada piutang ditemukan.</p>
                    </div>
                  ) : (
                     <>
                         <table className="hidden w-full sm:table">
                         <thead>
                         <tr className="border-b border-border/50">
                           <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">Debitur</th>
                           <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                           <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">Total</th>
                           <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">Sisa</th>
                           <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">Aksi</th>
                         </tr>
                       </thead>
                      <tbody>
                        {filteredCredits.map((credit) => {
                          const isReceived = credit.status === 'received'
                          const statusConfig = CREDIT_STATUS_LABELS[credit.status] || CREDIT_STATUS_LABELS.unreceived
                          return (
                            <motion.tr
                              key={credit.id}
                              variants={itemVariants}
                              whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                              className="border-b border-border/30 transition-colors last:border-0"
                            >
                               <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                   <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                                     {credit.icon || '💰'}
                                   </div>
                                   <div>
                                     <span className="font-medium text-text">{credit.debtorName}</span>
                                     {credit.note && (
                                       <p className="text-xs text-text-tertiary">{credit.note}</p>
                                     )}
                                   </div>
                                 </div>
                               </td>
                               <td className="px-6 py-4">
                                <Badge className={cn('border', statusConfig.badgeClass)}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-semibold text-text">
                                  {formatCurrencyFull(credit.amount, currency.code)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={cn('font-semibold', credit.remainingAmount > 0 ? 'text-green-500' : 'text-text-tertiary')}>
                                  {formatCurrencyFull(credit.remainingAmount, currency.code)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {!isReceived && credit.remainingAmount > 0 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => {
                                        setReceivingCredit(credit)
                                        setShowReceiveCreditModal(true)
                                      }}
                                      className={cn(
                                       'flex h-9 w-9 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20'
                                     )}
                                     aria-label={`Receive credit ${credit.debtorName}`}
                                     title="Terima"
                                     >
                                       <Plus size={16} />
                                    </motion.button>
                                  )}
                                  {credit.receipts && credit.receipts.length > 0 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => {
                                        const newExpanded = new Set(expandedDebts)
                                        if (newExpanded.has(credit.id)) newExpanded.delete(credit.id)
                                        else newExpanded.add(credit.id)
                                        setExpandedDebts(newExpanded)
                                      }}
                                      className={cn(
                                         'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                       )}
                                       aria-label={`Toggle receipt history for ${credit.debtorName}`}
                                       title="Riwayat"
                                     >
                                       {expandedDebts.has(credit.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </motion.button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCredit(credit)
                                      setShowEditCreditModal(true)
                                    }}
                                    className={cn(
                                      'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                     )}
                                     aria-label={`Edit ${credit.debtorName}`}
                                     title="Edit"
                                    >
                                      <Edit size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletingCredit(credit)
                                      setShowDeleteCreditModal(true)
                                    }}
                                    className={cn(
                                      'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                                     )}
                                     aria-label={`Delete ${credit.debtorName}`}
                                     title="Hapus"
                                    >
                                      <Trash2 size={16} />
                                  </button>
                            </div>
                          </td>
                        </motion.tr>
                      )})}

                      {filteredCredits.map((credit) => {
                         const isExpanded = expandedDebts.has(credit.id)
                         if (!isExpanded || (credit.receipts || []).length === 0) return null
                          return (
                            <tr key={`expand-credit-${credit.id}`} className="border-b border-border/20">
                              <td colSpan={5} className="px-6 py-3">
                               <div className="ml-12 space-y-2">
                                 <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                                   Riwayat Penerimaan
                                 </p>
                                 {credit.receipts.map((r) => (
                                   <div
                                     key={r.id}
                                     className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2"
                                   >
                                     <div>
                                       <span className="text-sm font-medium text-text">
                                         {formatCurrencyFull(r.amount, currency.code)}
                                       </span>
                                       <p className="text-xs text-text-tertiary">{formatReceiptDate(r)}</p>
                                     </div>
                                     {r.note && <span className="text-xs text-text-secondary">{r.note}</span>}
                                   </div>
                                 ))}
                               </div>
                             </td>
                           </tr>
                         )
                       })}
                       </tbody>
                     </table>

                     {/* Mobile Credit Cards */}
                     <div className="space-y-3 sm:hidden">
                       {filteredCredits.map((credit) => {
                         const isReceived = credit.status === 'received'
                         const statusConfig = CREDIT_STATUS_LABELS[credit.status] || CREDIT_STATUS_LABELS.unreceived
                         const isExpandedCredit = expandedDebts.has(credit.id)

                         return (
                           <motion.div
                             key={credit.id}
                             className="rounded-xl border border-border/50 bg-secondary/30 p-4"
                           >
                             <div className="flex items-center gap-3">
                               <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                                 {credit.icon || '💰'}
                               </div>
                                <div className="flex-1">
                                  <span className="font-medium text-text">{credit.debtorName}</span>
                                  {credit.note && (
                                    <p className="text-xs text-text-tertiary">{credit.note}</p>
                                  )}
                                  <Badge className={cn('border mt-1', statusConfig.badgeClass)}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                               <div className="text-right">
                                 <p className="text-xs text-text-tertiary">Total</p>
                                 <p className="font-semibold text-text">{formatCurrencyFull(credit.amount, currency.code)}</p>
                                 <p className="text-xs text-text-tertiary">Sisa</p>
                                 <p className={cn(
                                   'font-semibold',
                                   credit.remainingAmount > 0 ? 'text-green-500' : 'text-text-tertiary'
                                 )}>
                                   {formatCurrencyFull(credit.remainingAmount, currency.code)}
                                 </p>
                               </div>
                             </div>
                             <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/30 pt-3">
                               {!isReceived && credit.remainingAmount > 0 && (
                                 <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => {
                                     setReceivingCredit(credit)
                                     setShowReceiveCreditModal(true)
                                   }}
                                   className={cn(
                                     'flex h-9 w-9 items-center justify-center rounded-lg bg-success-500/10 text-success-500 transition-colors hover:bg-success-500/20'
                                   )}
                                   aria-label={`Receive credit ${credit.debtorName}`}
                                   title="Terima"
                                 >
                                   <Plus size={16} />
                                 </motion.button>
                               )}
                               {credit.receipts && credit.receipts.length > 0 && (
                                 <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => {
                                     const newExpanded = new Set(expandedDebts)
                                     if (newExpanded.has(credit.id)) newExpanded.delete(credit.id)
                                     else newExpanded.add(credit.id)
                                     setExpandedDebts(newExpanded)
                                   }}
                                   className={cn(
                                     'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                   )}
                                   aria-label={`Toggle receipt history`}
                                   title="Riwayat"
                                 >
                                   {isExpandedCredit ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                 </motion.button>
                               )}
                               <button
                                 type="button"
                                 onClick={() => {
                                   setEditingCredit(credit)
                                   setShowEditCreditModal(true)
                                 }}
                                 className={cn(
                                   'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                                 )}
                                 aria-label={`Edit ${credit.debtorName}`}
                                 title="Edit"
                               >
                                 <Edit size={16} />
                               </button>
                               <button
                                 type="button"
                                 onClick={() => {
                                   setDeletingCredit(credit)
                                   setShowDeleteCreditModal(true)
                                 }}
                                 className={cn(
                                   'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                                 )}
                                 aria-label={`Delete ${credit.debtorName}`}
                                 title="Hapus"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                             {isExpandedCredit && (credit.receipts || []).length > 0 && (
                               <div className="mt-3 space-y-2">
                                 <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                                   Riwayat Penerimaan
                                 </p>
                                 {credit.receipts.map((r) => (
                                   <div
                                     key={r.id}
                                     className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2"
                                   >
                                     <div>
                                       <span className="text-sm font-medium text-text">
                                         {formatCurrencyFull(r.amount, currency.code)}
                                       </span>
                                       <p className="text-xs text-text-tertiary">{formatReceiptDate(r)}</p>
                                     </div>
                                     {r.note && <span className="text-xs text-text-secondary">{r.note}</span>}
                                   </div>
                                 ))}
                               </div>
                             )}
                           </motion.div>
                         )
                       })}
                     </div>
                     </>
                   )}
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      <AddDebtModal
        open={showAddDebtModal}
        onClose={() => setShowAddDebtModal(false)}
        debt={null}
        onSave={handleAddDebtSave}
      />

      <AddDebtModal
        open={showEditDebtModal}
        onClose={() => {
          setShowEditDebtModal(false)
          setEditingDebt(null)
        }}
        debt={editingDebt}
        onSave={handleAddDebtSave}
      />

      <AddCreditModal
        open={showAddCreditModal}
        onClose={() => setShowAddCreditModal(false)}
        credit={null}
        onSave={handleAddCreditSave}
      />

      <AddCreditModal
        open={showEditCreditModal}
        onClose={() => {
          setShowEditCreditModal(false)
          setEditingCredit(null)
        }}
        credit={editingCredit}
        onSave={handleAddCreditSave}
      />

      <DebtPaymentModal
        open={showPayDebtModal}
        onClose={() => {
          setShowPayDebtModal(false)
          setPayingDebt(null)
        }}
        debt={payingDebt}
        availableBalance={availableBalance}
        onConfirm={handlePayDebtConfirm}
      />

      <CreditReceiptModal
        open={showReceiveCreditModal}
        onClose={() => {
          setShowReceiveCreditModal(false)
          setReceivingCredit(null)
        }}
        credit={receivingCredit}
        onConfirm={handleReceiveCreditConfirm}
      />

      <DeleteDebtConfirmation
        open={showDeleteDebtModal}
        onClose={() => {
          setShowDeleteDebtModal(false)
          setDeletingDebt(null)
        }}
        debt={deletingDebt}
        onConfirm={handleDeleteDebtConfirm}
      />

      <DeleteCreditConfirmation
        open={showDeleteCreditModal}
        onClose={() => {
          setShowDeleteCreditModal(false)
          setDeletingCredit(null)
        }}
        credit={deletingCredit}
        onConfirm={handleDeleteCreditConfirm}
      />
    </motion.div>
  )
}
