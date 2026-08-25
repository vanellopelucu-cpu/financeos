import { motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { useDashboardStore } from '../../app/store'
import { AddTransactionModal } from '../../components/AddTransactionModal'
import { LowBalanceWarning } from './components/LowBalanceWarning'
import { MoneyPockets } from './components/MoneyPockets'
import { RecentTransactions } from './components/RecentTransactions'
import { HeroBalanceCard } from './components/HeroBalanceCard'
import { UpcomingBillsReminder } from './components/UpcomingBillsReminder'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showLowBalance, setShowLowBalance] = useState(true)
  const { addTransaction, fetchTransactions, fetchAnalytics } = useDashboardStore()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full min-w-0 max-w-full flex-col gap-3 pt-32 sm:gap-4 md:pt-28 lg:gap-5"
    >
      {/* Low Balance Warning - appears automatically when below threshold */}
      {showLowBalance && (
        <LowBalanceWarning onDismiss={() => setShowLowBalance(false)} />
      )}

      {/* Desktop/Tablet: Available Balance + Upcoming Bills side by side */}
      <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-5 lg:gap-5">
        <motion.div variants={rowVariants} className="min-w-0 md:col-span-3">
          <HeroBalanceCard />
        </motion.div>
        <motion.div variants={rowVariants} className="min-w-0 md:col-span-2">
          <UpcomingBillsReminder />
        </motion.div>
      </div>

      {/* Money Pockets - Full Width */}
      <motion.div variants={rowVariants} className="min-w-0">
        <MoneyPockets />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={rowVariants} className="min-w-0">
        <RecentTransactions />
      </motion.div>

      <AddTransactionModal
        open={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSave={async (transaction) => {
          const result = await addTransaction(transaction)
          if (result.success) {
            setShowAddTransaction(false)
            await fetchTransactions()
            await fetchAnalytics()
          }
        }}
      />
    </motion.div>
  )
}
