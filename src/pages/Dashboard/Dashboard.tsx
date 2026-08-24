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
  const { addTransaction, fetchTransactions, fetchAnalytics } = useDashboardStore()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 pb-24"
    >
      {/* Low Balance Warning - appears automatically when below threshold */}
      <LowBalanceWarning />

      {/* Desktop: Available Balance + Upcoming Bills side by side */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-4">
        <motion.div variants={rowVariants} className="md:col-span-3">
          <HeroBalanceCard />
        </motion.div>
        <motion.div variants={rowVariants} className="md:col-span-2">
          <UpcomingBillsReminder />
        </motion.div>
      </div>

      {/* Mobile: Available Balance full width */}
      <motion.div variants={rowVariants} className="md:hidden">
        <HeroBalanceCard />
      </motion.div>

      {/* Mobile: Upcoming Bills full width */}
      <motion.div variants={rowVariants} className="md:hidden">
        <UpcomingBillsReminder />
      </motion.div>

      {/* Money Pockets - Full Width */}
      <motion.div variants={rowVariants}>
        <MoneyPockets />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={rowVariants}>
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
