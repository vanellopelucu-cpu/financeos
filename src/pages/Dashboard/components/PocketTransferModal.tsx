import { motion, type Variants } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../../app/providers/ThemeContext'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'
import type { MoneyPocket } from '../../../lib/types'

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

interface PocketTransferModalProps {
  open: boolean
  onClose: () => void
  pocket: MoneyPocket | null
  availableBalance: number
  mode: 'isi' | 'tarik'
  onConfirm: (amount: number) => Promise<{ success: boolean; error?: string }>
}

export function PocketTransferModal({
  open,
  onClose,
  pocket,
  availableBalance,
  mode,
  onConfirm,
}: PocketTransferModalProps) {
  const { theme } = useTheme()
  const { currentWorkspace } = useWorkspace()
  const currency = currentWorkspace.currency

  if (!open || !pocket) return null

  const title = mode === 'isi' ? 'Isi Pocket' : 'Tarik dari'
  const actionLabel = mode === 'isi' ? 'Isi Pocket' : 'Tarik'
  const icon = mode === 'isi' ? <TrendingDown size={16} /> : <TrendingUp size={16} />
  const isDark = theme === 'dark'

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
        className="w-full max-w-[90vw] sm:max-w-md"
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
            <div
              className={cn(
                'absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl',
                isDark ? 'bg-indigo-500/10' : 'bg-purple-200/20'
              )}
            />
          </div>

          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pocket.icon}</span>
                <h2 className="text-lg font-semibold text-text">
                  {title} {pocket.name}
                </h2>
              </div>
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
            <PocketTransferForm
              pocket={pocket}
              availableBalance={availableBalance}
              mode={mode}
              currency={currency}
              icon={icon}
              actionLabel={actionLabel}
              onConfirm={onConfirm}
              onCancel={onClose}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

interface PocketTransferFormProps {
  pocket: MoneyPocket
  availableBalance: number
  mode: 'isi' | 'tarik'
  currency: { code: 'LKR' | 'IDR' | 'USD'; symbol: string; name: string }
  icon: React.ReactNode
  actionLabel: string
  onConfirm: (amount: number) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
}

function PocketTransferForm({
  pocket,
  availableBalance,
  mode,
  currency,
  icon,
  actionLabel,
  onConfirm,
  onCancel,
}: PocketTransferFormProps) {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxAmount = mode === 'isi' ? availableBalance : pocket.currentAmount
  const balanceLabel = mode === 'isi' ? 'Available Balance' : 'Saldo Pocket'
  const balanceValue = mode === 'isi' ? availableBalance : pocket.currentAmount

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    const numAmount = Number(amount)
    if (numAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    const result = await onConfirm(numAmount)
    if (!result.success) {
      setError(result.error || 'Operation failed')
    }
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <form className="space-y-4">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/50 p-3">
        <Wallet size={16} className="text-text-tertiary" />
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-text-tertiary">
            {balanceLabel}
          </p>
          <p className="text-lg font-semibold text-text">
            {formatCurrencyFull(balanceValue, currency.code)}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary">Nominal</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {currency.symbol}
          </span>
          <input
            type="number"
            min="0"
            max={maxAmount}
            value={amount}
            onChange={handleAmountChange}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded-xl border border-border bg-secondary/50 pl-8 pr-3 py-2.5 text-lg text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none',
              error && 'border-red-500 focus:border-red-500'
            )}
            placeholder="0"
            autoFocus
          />
        </div>

        {mode === 'isi' && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setAmount(String(maxAmount))}
              className={cn(
                'text-xs font-medium text-workspace hover:underline'
              )}
            >
              Isi Maksimum ({formatCurrencyFull(maxAmount, currency.code)})
            </button>
          </div>
        )}

        {mode === 'tarik' && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setAmount(String(maxAmount))}
              className={cn(
                'text-xs font-medium text-workspace hover:underline'
              )}
            >
              Tarik Maksimum ({formatCurrencyFull(maxAmount, currency.code)})
            </button>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'rounded-xl border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
          )}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !amount || Number(amount) <= 0}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
          )}
        >
          {icon}
          {isSubmitting ? 'Memproses...' : actionLabel}
        </button>
      </div>
    </form>
  )
}

