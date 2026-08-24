import { motion } from 'framer-motion'
import { Pencil, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'
import type { MoneyPocket } from '../../../lib/types'
import { AddPocketModal } from './AddPocketModal'
import { EditPocketModal } from './EditPocketModal'
import { DeleteConfirmation } from './DeleteConfirmation'
import { PocketTransferModal } from './PocketTransferModal'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const DEFAULT_POCKETS = [
  { id: 'pocket-pendidikan', name: 'Pendidikan', icon: '🎓' },
  { id: 'pocket-dana-darurat', name: 'Dana Darurat', icon: '🚨' },
  { id: 'pocket-liburan', name: 'Liburan', icon: '🏖️' },
  { id: 'pocket-tabungan-rumah', name: 'Tabungan Rumah', icon: '🏠' },
]

export function MoneyPockets() {
  const { currentWorkspace } = useWorkspace()
  const { currency, theme } = currentWorkspace
  const { moneyPockets = [], balance, addPocket, editPocket, deletePocket, fetchMoneyPockets, addToPocket, withdrawFromPocket } =
    useDashboardStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferMode, setTransferMode] = useState<'isi' | 'tarik'>('isi')
  const [editingPocket, setEditingPocket] = useState<MoneyPocket | null>(null)
  const [deletingPocket, setDeletingPocket] = useState<MoneyPocket | null>(null)
  const [transferPocket, setTransferPocket] = useState<MoneyPocket | null>(null)
  const [dismissedDefaults, setDismissedDefaults] = useState<Set<string>>(new Set())

  const pocketMap = new Map((moneyPockets || []).map((p) => [p.name, p]))
  const defaultPocketsMerged = DEFAULT_POCKETS.filter((dp) => !dismissedDefaults.has(dp.id)).map((dp) => {
    const existing = pocketMap.get(dp.name)
    if (existing) return existing
    return {
      id: dp.id,
      name: dp.name,
      icon: dp.icon,
      currentAmount: 0,
      targetAmount: 0,
      status: 'just-started' as const,
    }
  })
  const pockets = [...defaultPocketsMerged, ...(moneyPockets || []).filter((p) => !DEFAULT_POCKETS.some((dp) => dp.name === p.name))]
  const filteredPockets = currency.code === 'LKR' ? [] : pockets

  const handleAddSave = async (pocket: {
    name: string
    icon: string
    currentAmount: number
    targetAmount: number
  }) => {
    const progress = pocket.targetAmount > 0 ? (pocket.currentAmount / pocket.targetAmount) * 100 : 0
    let status: MoneyPocket['status'] = 'just-started'
    if (progress >= 100) status = 'completed'
    else if (progress >= 75) status = 'on-track'
    else if (progress >= 50) status = 'on-track'
    else if (progress >= 25) status = 'behind'
    else status = 'just-started'

    const result = await addPocket({
      ...pocket,
      status,
    })
    if (result.success) {
      setShowAddModal(false)
      await fetchMoneyPockets()
    }
  }

  const handleEditSave = async (id: string, pocket: {
    name: string
    icon: string
    currentAmount: number
    targetAmount: number
  }) => {
    const progress =
      pocket.targetAmount > 0 ? (pocket.currentAmount / pocket.targetAmount) * 100 : 0
    let status: MoneyPocket['status'] = 'just-started'
    if (progress >= 100) status = 'completed'
    else if (progress >= 50) status = 'on-track'
    else if (progress >= 25) status = 'behind'
    else status = 'just-started'

    const isDefaultId = id.startsWith('pocket-')

    if (isDefaultId) {
      const result = await addPocket({
        ...pocket,
        status,
      })
      if (result.success) {
        setShowEditModal(false)
        setEditingPocket(null)
        setDismissedDefaults((prev) => new Set(prev).add(id))
        await fetchMoneyPockets()
      }
      return
    }

    const result = await editPocket(id, {
      ...pocket,
      status,
    })
    if (result.success) {
      setShowEditModal(false)
      setEditingPocket(null)
      await fetchMoneyPockets()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPocket) return
    const isDefaultId = deletingPocket.id.startsWith('pocket-')
    if (isDefaultId) {
      setDismissedDefaults((prev) => new Set(prev).add(deletingPocket.id))
      setShowDeleteModal(false)
      setDeletingPocket(null)
      return
    }
    const result = await deletePocket(deletingPocket.id)
    if (result.success) {
      setShowDeleteModal(false)
      setDeletingPocket(null)
      await fetchMoneyPockets()
    }
  }

  const handleTransferConfirm = async (amount: number) => {
    if (!transferPocket) return
    if (transferMode === 'isi') {
      await addToPocket(transferPocket, amount)
    } else {
      await withdrawFromPocket(transferPocket, amount)
    }
    setShowTransferModal(false)
    setTransferPocket(null)
  }

  const getProgress = (pocket: MoneyPocket) => {
    if (pocket.targetAmount <= 0) return 0
    return Math.min(100, (pocket.currentAmount / pocket.targetAmount) * 100)
  }

  const handleIsiClick = (pocket: MoneyPocket) => {
    setTransferPocket(pocket)
    setTransferMode('isi')
    setShowTransferModal(true)
  }

  const handleTarikClick = (pocket: MoneyPocket) => {
    setTransferPocket(pocket)
    setTransferMode('tarik')
    setShowTransferModal(true)
  }

  const handleEditClick = (pocket: MoneyPocket) => {
    setEditingPocket(pocket)
    setShowEditModal(true)
  }

  const handleDeleteClick = (pocket: MoneyPocket) => {
    setDeletingPocket(pocket)
    setShowDeleteModal(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      <Card glass elevated className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Money Pockets
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Wallet size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {filteredPockets.map((pocket) => (
              <motion.div
                key={pocket.id}
                variants={cardVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 p-4 transition-all duration-300 sm:p-5'
                )}
              >
                <div className="absolute inset-0 -z-10">
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                      currentWorkspace.theme === 'green'
                        ? 'bg-gradient-to-br from-sri-500/5 to-transparent'
                        : 'bg-gradient-to-br from-indo-500/5 to-transparent'
                    )}
                  />
                </div>

                <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">{pocket.icon}</span>
                  <h3 className="text-sm font-semibold text-text sm:text-base">
                    {pocket.name}
                  </h3>
                </div>

                <p className="text-xl font-bold text-text sm:text-2xl">
                  {formatCurrencyFull(pocket.currentAmount, currency.code)}
                </p>

                 <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                     <span>
                       Target: {formatCurrencyFull(pocket.targetAmount, currency.code)}
                     </span>
                     <span>
                       {Math.round(getProgress(pocket))}%
                     </span>
                   </div>
                   <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
                     <motion.div
                       className="h-full rounded-full"
                       style={{
                         width: `${getProgress(pocket)}%`,
                         backgroundColor: theme === 'green'
                           ? (pocket.status === 'completed'
                               ? '#22c55e'
                               : pocket.status === 'behind'
                                 ? '#ef4444'
                                 : pocket.status === 'just-started'
                                   ? '#f97316'
                                   : '#eab308')
                           : (pocket.status === 'completed'
                               ? '#3b82f6'
                               : pocket.status === 'behind'
                                 ? '#ef4444'
                                 : pocket.status === 'just-started'
                                   ? '#f97316'
                                   : '#eab308'),
                       }}
                       initial={{ width: 0 }}
                       animate={{ width: `${getProgress(pocket)}%` }}
                       transition={{ duration: 0.5, ease: 'easeOut' }}
                     />
                   </div>
                 </div>

                 <div className="mt-3 flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={(e) => {
                         e.stopPropagation()
                         handleIsiClick(pocket)
                       }}
                       title="Isi"
                       className={cn(
                         'flex flex-1 items-center justify-center gap-1 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-2.5 text-xs font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 sm:py-1.5'
                       )}
                     >
                       <TrendingDown size={14} />
                       + Isi
                     </motion.button>
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={(e) => {
                         e.stopPropagation()
                         handleTarikClick(pocket)
                       }}
                       title="Tarik"
                       className={cn(
                         'flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-secondary/50 px-3 py-2.5 text-xs font-medium text-text-secondary transition-all hover:bg-secondary sm:py-1.5'
                       )}
                     >
                       <TrendingUp size={12} />
                       Tarik
                     </motion.button>
                   </div>
                   <div className="flex items-center justify-end gap-1">
                     <motion.button
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={(e) => {
                         e.stopPropagation()
                         handleEditClick(pocket)
                       }}
                       title="Edit"
                       className={cn(
                         'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                       )}
                     >
                       <Pencil size={16} />
                     </motion.button>
                     <motion.button
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={(e) => {
                         e.stopPropagation()
                         handleDeleteClick(pocket)
                       }}
                       title="Hapus"
                       className={cn(
                         'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-error-500/10 hover:text-error-500'
                       )}
                     >
                       <Trash2 size={16} />
                     </motion.button>
                   </div>
                 </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      <AddPocketModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSave}
      />

      {editingPocket && (
        <EditPocketModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingPocket(null)
          }}
          pocket={editingPocket}
          onSave={handleEditSave}
        />
      )}

      {deletingPocket && (
        <DeleteConfirmation
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingPocket(null)
          }}
          pocket={deletingPocket}
          onConfirm={async () => await handleDeleteConfirm()}
        />
      )}

      {transferPocket && (
        <PocketTransferModal
          open={showTransferModal}
          onClose={() => {
            setShowTransferModal(false)
            setTransferPocket(null)
          }}
          pocket={transferPocket}
          availableBalance={balance?.availableBalance || 0}
          mode={transferMode}
          onConfirm={async (amount) => {
            await handleTransferConfirm(amount)
            return { success: true }
          }}
        />
      )}
    </motion.div>
  )
}
