import { motion, type Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { cn } from '../../../lib/utils'
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

const BILL_ICONS = ['💡', '💧', '⚡', '📺', '🌐', '🏠', '🚗', '📱', '💰', '📄']

interface EditBillModalProps {
  open: boolean
  onClose: () => void
  bill: Bill | null
  categories: string[]
  onSave: (id: string, bill: Partial<Omit<Bill, 'id'>>) => Promise<void>
}

export function EditBillModal({ open, onClose, bill, categories, onSave }: EditBillModalProps) {
  const { theme } = useTheme()

  if (!open || !bill) return null

  const [title, setTitle] = useState(bill.title)
  const [amount, setAmount] = useState(String(bill.amount))
  const [dueDate, setDueDate] = useState(bill.dueDate ? bill.dueDate.split('T')[0] : '')
  const [category, setCategory] = useState(bill.category || 'Bills & Utilities')
  const [recurring, setRecurring] = useState(bill.recurring || false)
  const [icon, setIcon] = useState(bill.icon || '💡')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(bill.id, {
      title: title.trim(),
      amount: Number(amount),
      dueDate,
      icon,
      recurring,
      category,
    })
  }

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
        className="w-full max-w-[95vw] sm:max-w-lg"
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
              <h2 className="text-lg font-semibold text-text">Edit Bill</h2>
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
                  Bill Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={cn(
                    'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="e.g. Electricity Bill"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    className={cn(
                      'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    min={today}
                    className={cn(
                      'w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(
                    'w-full cursor-pointer rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text focus:border-workspace focus:outline-none'
                  )}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BILL_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all',
                        icon === ic
                          ? 'ring-2 ring-workspace bg-workspace/10'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-workspace focus:ring-workspace"
                  />
                  Recurring bill
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'rounded-xl border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className={cn(
                    'rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
                  )}
                >
                  Save
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

