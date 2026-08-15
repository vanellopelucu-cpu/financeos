import { motion, type Variants } from 'framer-motion'
import { Trash2, X } from 'lucide-react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn } from '../../../lib/utils'
import type { Bill } from '../../../lib/types'

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

interface DeleteBillConfirmationProps {
  open: boolean
  onClose: () => void
  bill: Bill | null
  onConfirm: (id: string) => Promise<void>
}

export function DeleteBillConfirmation({
  open,
  onClose,
  bill,
  onConfirm,
}: DeleteBillConfirmationProps) {
  const { theme } = useTheme()

  if (!open || !bill) return null

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
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-6 pt-6">
                <CardTitle className="text-lg font-semibold text-text">
                Delete this bill?
              </CardTitle>
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
              className="mb-6 flex items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl">
                {bill.icon || '📄'}
              </div>
              <div>
                <p className="font-semibold text-text">{bill.title}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              className="flex items-center justify-end gap-3 border-t border-border/50 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-border'
                )}
              >
                <X size={16} />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onConfirm(bill.id)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-red-600 hover:to-red-700'
                )}
              >
                <Trash2 size={16} />
                Delete
              </motion.button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
