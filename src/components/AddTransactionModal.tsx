import { motion, type Variants } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useDashboardStore } from '../app/store'
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
  const { accounts } = useDashboardStore()
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('General')
  const [notes, setNotes] = useState('')
  const [workspace, setWorkspace] = useState<WorkspaceId>(currentWorkspace.id)
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '')

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
      accountId: accountId || undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-[95vw] sm:max-w-lg"
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

          <CardHeader className={cn(
            'border-b pb-4',
            isDark ? 'border-border/30' : 'border-border/50'
          )}>
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <h2 className={cn(
                'text-lg font-semibold',
                isDark ? 'text-text' : 'text-text'
              )}>Tambah Catatan</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                  isDark ? 'text-text-secondary hover:bg-white/10 hover:text-text' : 'text-text-tertiary hover:bg-secondary hover:text-text'
                )}
              >
                <X size={16} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  isDark ? 'text-text-secondary' : 'text-text-secondary'
                )}>
                  Jenis
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === 'income'}
                      onChange={() => setType('income')}
                      className={cn(
                        'h-4 w-4 cursor-pointer focus:ring-workspace',
                        isDark ? 'accent-workspace' : 'text-workspace'
                      )}
                    />
                    <span className={cn(
                      'text-sm',
                      isDark ? 'text-text' : 'text-text'
                    )}>Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === 'expense'}
                      onChange={() => setType('expense')}
                      className={cn(
                        'h-4 w-4 cursor-pointer focus:ring-workspace',
                        isDark ? 'accent-workspace' : 'text-workspace'
                      )}
                    />
                    <span className={cn(
                      'text-sm',
                      isDark ? 'text-text' : 'text-text'
                    )}>Pengeluaran</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  isDark ? 'text-text-secondary' : 'text-text-secondary'
                )}>
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className={cn(
                    'w-full rounded-xl border px-3 py-2 text-sm focus:outline-none',
                    isDark
                      ? 'border-border bg-surface/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                      : 'border-border bg-secondary/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                  )}
                  placeholder="e.g. Gaji, Makan, Belanja"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    isDark ? 'text-text-secondary' : 'text-text-secondary'
                  )}>
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
                      'w-full rounded-xl border px-3 py-2 text-sm focus:outline-none',
                      isDark
                        ? 'border-border bg-surface/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                        : 'border-border bg-secondary/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                    )}
                    placeholder="0"
                  />
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                    <p className={cn(
                      'mt-1 text-xs',
                      isDark ? 'text-text-tertiary' : 'text-text-secondary'
                    )}>
                      Preview: {formatCurrencyFull(type === 'income' ? parseFloat(amount) : -parseFloat(amount), currentWorkspace.currency.code)}
                    </p>
                  )}
                </div>
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    isDark ? 'text-text-secondary' : 'text-text-secondary'
                  )}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    max={today}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2 text-sm focus:outline-none',
                      isDark
                        ? 'border-border bg-surface/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                        : 'border-border bg-secondary/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  isDark ? 'text-text-secondary' : 'text-text-secondary'
                )}>
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(
                    'w-full cursor-pointer rounded-xl border px-3 py-2 text-sm focus:outline-none',
                    isDark
                      ? 'border-border bg-surface/50 text-text focus:border-workspace'
                      : 'border-border bg-secondary/50 text-text focus:border-workspace'
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
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  isDark ? 'text-text-secondary' : 'text-text-secondary'
                )}>
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2 text-sm focus:outline-none resize-none',
                    isDark
                      ? 'border-border bg-surface/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                      : 'border-border bg-secondary/50 text-text placeholder:text-text-tertiary focus:border-workspace'
                  )}
                  placeholder="Tambahkan catatan..."
                />
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  isDark ? 'text-text-secondary' : 'text-text-secondary'
                )}>
                  Workspace
                </label>
                <select
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value as WorkspaceId)}
                  className={cn(
                    'w-full cursor-pointer rounded-xl border px-3 py-2 text-sm focus:outline-none',
                    isDark
                      ? 'border-border bg-surface/50 text-text focus:border-workspace'
                      : 'border-border bg-secondary/50 text-text focus:border-workspace'
                  )}
                >
                  {WORKSPACES.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} ({ws.currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {accounts.length > 0 && (
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    isDark ? 'text-text-secondary' : 'text-text-secondary'
                  )}>
                    Akun
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className={cn(
                      'w-full cursor-pointer rounded-xl border px-3 py-2 text-sm focus:outline-none',
                      isDark
                        ? 'border-border bg-surface/50 text-text focus:border-workspace'
                        : 'border-border bg-secondary/50 text-text focus:border-workspace'
                    )}
                  >
                    <option value="">Pilih Akun</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name} ({formatCurrencyFull(acc.balance, currentWorkspace.currency.code)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={cn(
                'flex items-center justify-end gap-3 pt-4',
                isDark ? 'border-t border-border/30' : 'border-t border-border/50'
              )}>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'rounded-xl border px-5 py-2 text-sm font-medium transition-all',
                    isDark
                      ? 'border-border text-text-secondary hover:bg-white/10'
                      : 'border-border text-text-secondary hover:bg-border'
                  )}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!description.trim() || !amount}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border border-transparent px-5 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50',
                    isDark
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600'
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

