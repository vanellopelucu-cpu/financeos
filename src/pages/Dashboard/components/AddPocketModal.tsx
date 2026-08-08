import { motion, type Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { cn } from '../../../lib/utils'
import type { MoneyPocket } from '../../../lib/types'
import { PocketIconSelector } from './PocketIconSelector'

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

interface AddPocketModalProps {
  open: boolean
  onClose: () => void
  onSave: (pocket: Omit<MoneyPocket, 'id' | 'status'> & {
    icon: string
    currentAmount: number
    targetAmount: number
  }) => Promise<void>
}

export function AddPocketModal({ open, onClose, onSave }: AddPocketModalProps) {
  const { theme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const currency = currentWorkspace.currency

  if (!open) return null

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md"
      >
        <Card
          glass
          elevated
          className={cn(
            'relative border-0 p-0 shadow-2xl',
            theme === 'dark'
              ? 'bg-gradient-to-br from-surface/60 via-surface/40 to-purple-900/10'
              : 'bg-gradient-to-br from-surface via-surface to-indigo-50/50'
          )}
        >
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl',
                theme === 'dark' ? 'bg-purple-500/15' : 'bg-indigo-300/20'
              )}
            />
            <div
              className={cn(
                'absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl',
                theme === 'dark' ? 'bg-indigo-500/10' : 'bg-purple-200/20'
              )}
            />
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="text-lg font-semibold text-text">Add Pocket</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                )}
              >
                <X size={16} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AddPocketForm
              currency={currency}
              onSave={onSave}
              onCancel={onClose}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

interface AddPocketFormProps {
  currency: { code: 'LKR' | 'IDR'; symbol: string; name: string }
  onSave: (pocket: Omit<MoneyPocket, 'id' | 'status'> & {
    icon: string
    currentAmount: number
    targetAmount: number
  }) => Promise<void>
  onCancel: () => void
}

function AddPocketForm({ currency, onSave, onCancel }: AddPocketFormProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💰')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetAmount, setTargetAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave({
      name: name.trim(),
      icon,
      currentAmount: Number(currentAmount) || 0,
      targetAmount: Number(targetAmount) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary">Pocket Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            'mt-1 w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
          )}
          placeholder="e.g. Laptop"
        />
      </div>

      <PocketIconSelector icon={icon} onChange={setIcon} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary">Current Balance</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{currency.symbol}</span>
            <input
              type="number"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className={cn(
                'w-full rounded-xl border border-border bg-secondary/50 pl-8 pr-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
              )}
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">Target Amount</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{currency.symbol}</span>
            <input
              type="number"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className={cn(
                'w-full rounded-xl border border-border bg-secondary/50 pl-8 pr-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
              )}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'rounded-xl border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className={cn(
            'rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
          )}
        >
          Save
        </button>
      </div>
    </form>
  )
}
