import { motion, type Variants } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { cn } from '../../../lib/utils'
import type { Credit } from '../../../lib/types'

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

interface DeleteCreditConfirmationProps {
  open: boolean
  onClose: () => void
  credit: Credit | null
  onConfirm: () => Promise<void>
}

export function DeleteCreditConfirmation({ open, onClose, credit, onConfirm }: DeleteCreditConfirmationProps) {
  const { theme } = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!open || !credit) return null

  const handleConfirm = async () => {
    setIsProcessing(true)
    await onConfirm()
    setIsProcessing(false)
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
        className="w-full max-w-md"
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
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-6 pt-6">
              <CardTitle className="text-lg font-semibold text-text">
                Hapus Piutang?
              </CardTitle>
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

          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                {credit.icon || '💰'}
              </div>
              <div>
                <p className="font-semibold text-text">{credit.debtorName}</p>
                <p className="text-sm text-text-secondary">
                  {credit.receipts && credit.receipts.length > 0
                    ? `${credit.receipts.length} penerimaan telah tercatat`
                    : 'Belum ada penerimaan'}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-error-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-error-500" />
                <p className="text-sm text-text-secondary">
                  Tindakan ini tidak dapat dibatalkan. Semua data penerimaan terkait akan hilang.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={isProcessing}
                className={cn(
                  'rounded-xl border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
                )}
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isProcessing}
                className={cn(
                  'rounded-xl border border-transparent bg-error-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-error-600 disabled:opacity-50'
                )}
              >
                {isProcessing ? 'Menghapus...' : 'Hapus'}
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

