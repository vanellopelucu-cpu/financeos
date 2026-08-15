import { motion, type Variants } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { WORKSPACES } from '../lib/data'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { cn, formatCurrencyFull, getCategoryIcon } from '../lib/utils'
import type { Transaction, WorkspaceId } from '../lib/types'

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

const TRANSACTION_CATEGORIES = [
  'Salary',
  'Investment',
  'Transfer',
  'Bills & Utilities',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Groceries',
  'Subscription',
  'Coffee',
  'General',
]

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSave: (transaction: Omit<Transaction, 'id'>) => Promise<{ success: boolean; error?: string } | void>
}

export function AddTransactionModal({ open, onClose, onSave }: AddTransactionModalProps) {
  const { theme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('General')
  const [notes, setNotes] = useState('')
  const [workspace, setWorkspace] = useState<WorkspaceId>(currentWorkspace.id)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) return

    const signedAmount = type === 'income' ? numericAmount : -numericAmount

    await onSave({
      description: description.trim(),
      category,
      date,
      amount: signedAmount,
      icon: getCategoryIcon(category),
    })
  }

  const isDark = theme === 'dark'
  const today = new Date().toISOString().split('T')[0]

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
        className="w-full max-w-lg"
      >
        <Card
          glass
          elevated
          className={cn(
            'relative border-0 p-0 shadow-2xl',
            isDark
              ? 'bg-gradient-to-br from-surface/60 via-surface/40 to-purple-900/10'
              : 'bg-gradient-to-br from-surface via-surface to-indigo-50/50'
          )}
        >
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl',
                isDark ? 'bg-purple-500/15' : 'bg-indigo-300/20'
              )}
            />
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="text-lg font-semibold text-text">Tambah Catatan</h2>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Jenis
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === 'income'}
                      onChange={() => setType('income')}
                      className="h-4 w-4 cursor-pointer text-workspace focus:ring-workspace"
                    />
                    <span className="text-sm text-text">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === 'expense'}
                      onChange={() => setType('expense')}
                      className="h-4 w-4 cursor-pointer text-workspace focus:ring-workspace"
                    />
                    <span className="text-sm text-text">Pengeluaran</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className={cn(
                    'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="e.g. Gaji, Makan, Belanja"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nominal
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    step="1"
                    className={cn(
                      'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                    placeholder="0"
                  />
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                    <p className="mt-1 text-xs text-text-secondary">
                      Preview: {formatCurrencyFull(type === 'income' ? parseFloat(amount) : -parseFloat(amount), currentWorkspace.currency.code)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    max={today}
                    className={cn(
                      'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(
                    'w-full cursor-pointer rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text focus:border-workspace focus:outline-none'
                  )}
                >
                  {TRANSACTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryIcon(cat)} {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={cn(
                    'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none resize-none'
                  )}
                  placeholder="Tambahkan catatan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Workspace
                </label>
                <select
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value as WorkspaceId)}
                  className={cn(
                    'w-full cursor-pointer rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text focus:border-workspace focus:outline-none'
                  )}
                >
                  {WORKSPACES.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} ({ws.currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'rounded-xl border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
                  )}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!description.trim() || !amount}
                  className={cn(
                    'rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2'
                  )}
                >
                  <Plus size={14} />
                  Simpan
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
