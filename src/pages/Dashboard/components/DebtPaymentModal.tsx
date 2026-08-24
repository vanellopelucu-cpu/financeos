import { motion, type Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'
import type { Debt } from '../../../lib/types'
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

interface DebtPaymentModalProps {
  open: boolean
  onClose: () => void
  debt: Debt | null
  availableBalance: number
  onConfirm: (amount: number, paymentDate: string, note?: string) => Promise<{ success: boolean; error?: string }>
}

export function DebtPaymentModal({ open, onClose, debt, availableBalance, onConfirm }: DebtPaymentModalProps) {
  const { theme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!open || !debt) return null

  const today = new Date().toISOString().split('T')[0]
  const remaining = debt.remainingAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    if (Number(amount) > remaining) return

    setIsProcessing(true)
    await onConfirm(Number(amount), paymentDate, note.trim() || undefined)
    setIsProcessing(false)
  }

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-[90vw] sm:max-w-md"
      >
        <Card
          glass
          elevated
          className={cn(
            'relative border-0 p-0 shadow-2xl',
            theme === 'dark'
              ? 'bg-gradient-to-br from-surface/60 via-surface/40 to-red-900/10'
              : 'bg-gradient-to-br from-surface via-surface to-red-50/50'
          )}
        >
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl',
                theme === 'dark' ? 'bg-red-500/15' : 'bg-red-300/20'
              )}
            />
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-lg font-semibold text-text">
                Bayar Hutang
              </CardTitle>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={isProcessing}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-secondary hover:text-text'
                )}
              >
                <X size={16} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                {debt.icon || '🧾'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text">{debt.creditorName}</p>
                <p className="text-sm text-text-secondary">
                  Sisa: {formatCurrencyFull(remaining, currency.code)}
                </p>
              </div>
              <span className="text-right font-semibold text-red-500">
                -{formatCurrencyFull(remaining, currency.code)}
              </span>
            </div>

            <p className="mb-3 text-sm text-text-secondary">
              Saldo tersedia: {formatCurrencyFull(availableBalance, currency.code)}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Jumlah Bayar
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max={remaining}
                  step="1000"
                  className={cn(
                    'w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={today}
                  className={cn(
                    'w-full cursor-pointer rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text focus:border-workspace focus:outline-none'
                  )}
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
                    'w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="Opsional"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-border'
                  )}
                >
                  <X size={16} />
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isProcessing || !amount || Number(amount) <= 0 || Number(amount) > remaining}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-red-600 hover:to-rose-700 disabled:opacity-50'
                  )}
                >
                  <Check size={16} />
                  {isProcessing ? 'Memproses...' : 'Bayar'}
                </motion.button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

