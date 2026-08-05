import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull } from '../../../lib/utils'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const statusColors = {
  'on-track': {
    bg: 'bg-workspace/10',
    text: 'text-workspace',
    label: 'On Track',
  },
  behind: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    label: 'Behind',
  },
  completed: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-500',
    label: 'Completed',
  },
  'just-started': {
    bg: 'bg-slate-400/10',
    text: 'text-slate-500',
    label: 'Just Started',
  },
}

export function MoneyPockets() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { moneyPockets } = useDashboardStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      <Card glass elevated className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Money Pockets
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Target size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {moneyPockets.map((pocket) => {
              const progress = Math.min(
                100,
                (pocket.currentAmount / pocket.targetAmount) * 100
              )
              const statusConfig = statusColors[pocket.status]

              return (
                <motion.div
                  key={pocket.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 p-5 transition-all duration-300'
                  )}
                >
                  <div className="absolute inset-0 -z-10">
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                        currentWorkspace.theme === 'green'
                          ? 'bg-gradient-to-br from-sri-500/5 to-transparent'
                          : 'bg-gradient-to-br from-indo-500/5 to-transparent'
                      )}
                    />
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl">{pocket.icon}</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-text">
                    {pocket.name}
                  </h3>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-text">
                        {formatCurrencyFull(pocket.currentAmount, currency.code)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        of {formatCurrencyFull(pocket.targetAmount, currency.code)}
                      </p>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/50">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          currentWorkspace.theme === 'green'
                            ? 'bg-gradient-to-r from-sri-400 to-sri-600'
                            : 'bg-gradient-to-r from-indo-400 to-indo-600'
                        )}
                        style={{ width: `${progress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full'
                        )}
                        style={{
                          background: `linear-gradient(to right, transparent ${progress}%, hsla(0,0%,100%,0.05) ${progress}%, transparent ${progress}%)`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-text-tertiary">
                        {Math.round(progress)}% saved
                      </span>
                      <span className="text-xs font-medium text-text-secondary">
                        {formatCurrencyFull(
                          pocket.targetAmount - pocket.currentAmount,
                          currency.code
                        )}{' '}
                        left
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
