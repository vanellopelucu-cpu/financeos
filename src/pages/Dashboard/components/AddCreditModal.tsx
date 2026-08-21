import { motion, type Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { cn } from '../../../lib/utils'
import type { Credit } from '../../../lib/types'
import { useState } from 'react'

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

const CREDIT_ICONS = ['💰', '🏦', '🧾', '📱', '🚗', '📚', '⚡', '💧', '📺', '📄']

interface AddCreditModalProps {
  open: boolean
  onClose: () => void
  credit: Credit | null
  onSave: (id: string | null, credit: Partial<Omit<Credit, 'id' | 'receipts' | 'status' | 'remainingAmount'>>) => Promise<void>
}

export function AddCreditModal({ open, onClose, credit, onSave }: AddCreditModalProps) {
  const { theme } = useTheme()
  const isEdit = !!credit
  const [debtorName, setDebtorName] = useState(credit?.debtorName ?? '')
  const [amount, setAmount] = useState(credit ? String(credit.amount) : '')
  const [note, setNote] = useState(credit?.note ?? '')
  const [icon, setIcon] = useState(credit?.icon || '💰')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debtorName.trim() || !amount) return

    await onSave(
      credit?.id ?? null,
      {
        debtorName: debtorName.trim(),
        amount: Number(amount),
        note: note.trim() || undefined,
        icon,
      }
    )
  }

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
        className="w-full max-w-[95vw] sm:max-w-lg"
      >
        <Card
          glass
          elevated
          className={cn(
            'relative border-0 p-0 shadow-2xl',
            theme === 'dark'
              ? 'bg-gradient-to-br from-surface/60 via-surface/40 to-green-900/10'
              : 'bg-gradient-to-br from-surface via-surface to-green-50/50'
          )}
        >
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl',
                theme === 'dark' ? 'bg-green-500/15' : 'bg-green-300/20'
              )}
            />
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <h2 className="text-lg font-semibold text-text">
                {isEdit ? 'Edit Piutang' : 'Tambah Piutang'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                )}
              >
                <X size={16} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Debitur
                </label>
                <input
                  type="text"
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                  required
                  className={cn(
                    'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="e.g. Kumar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="1000"
                  className={cn(
                    'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-secondary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="Opsional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {CREDIT_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all',
                        icon === ic
                          ? 'ring-2 ring-green-500 bg-green-500/10'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
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
                  disabled={!debtorName.trim() || !amount}
                  className={cn(
                    'rounded-xl border border-transparent bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-700 disabled:opacity-50'
                  )}
                >
                  {isEdit ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

