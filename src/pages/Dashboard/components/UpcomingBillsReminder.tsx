import { motion } from 'framer-motion'
import { ChevronRight, Clock } from 'lucide-react'
import { useWorkspace } from '../../../app/providers/WorkspaceContext'
import { useDashboardStore } from '../../../app/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn, formatCurrencyFull, getDueDateLabel } from '../../../lib/utils'

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export function UpcomingBillsReminder() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace
  const { upcomingBills } = useDashboardStore()

  const sortedBills = [...upcomingBills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-full"
    >
      <Card
        glass
        elevated
        className="h-full border-0 p-0 shadow-xl"
      >
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Upcoming Bills
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Clock size={16} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <motion.div
            className="flex flex-col"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {sortedBills.map((bill) => (
              <motion.div
                key={bill.id}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'hsl(var(--color-bg-secondary) / 0.5)' }}
                className={cn(
                  'group flex items-center justify-between border-b border-border/30 p-4 transition-all last:border-0'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl shadow-soft">
                    {bill.icon || '📄'}
                  </div>
                  <div>
                    <p className="font-semibold text-text">{bill.title}</p>
                    <p className="text-sm text-text-secondary">
                      {getDueDateLabel(bill.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-right font-semibold text-text">
                    {formatCurrencyFull(bill.amount, currency.code)}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-text-tertiary transition-transform group-hover:translate-x-1"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex w-full items-center justify-center gap-2 border-t border-border/50 py-4 text-sm font-medium text-workspace transition-colors hover:text-workspace-hover'
            )}
          >
            View All Bills
            <ChevronRight size={16} />
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
