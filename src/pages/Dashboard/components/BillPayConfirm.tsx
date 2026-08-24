import { motion, type Variants } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'
import type { Bill } from '../../../lib/types'
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

interface BillPayConfirmProps {
  open: boolean
  onClose: () => void
  bill: Bill | null
  currency: 'LKR' | 'IDR' | 'USD'
  onConfirm: (paidDate: string) => Promise<{ success: boolean; error?: string }>
}

export function BillPayConfirm({ open, onClose, bill, currency, onConfirm }: BillPayConfirmProps) {
  const { theme } = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().split('T')[0])

  if (!open || !bill) return null

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const result = await onConfirm(paidDate)

      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Gagal memproses pembayaran.')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
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
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-lg font-semibold text-text">
                Tandai tagihan ini sudah dibayar?
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
              className="mb-6 flex items-center gap-4"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl shadow-soft">
                {bill.icon || '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text truncate">{bill.title}</p>
                <p className="text-sm text-text-secondary truncate">{bill.provider || ''}</p>
              </div>
              <span className="font-semibold text-red-500 flex-shrink-0">
                -{formatCurrencyFull(bill.amount, currency)}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              className="mb-4"
            >
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                max={today}
                className={cn(
                  'w-full cursor-pointer rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-text focus:border-workspace focus:outline-none'
                )}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-500"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
              className="flex items-center justify-end gap-3 border-t border-border/50 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                onClick={handleSubmit}
                disabled={isProcessing}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50'
                )}
              >
                <Check size={16} />
                {isProcessing ? 'Memproses...' : 'Tandai Dibayar'}
              </motion.button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
