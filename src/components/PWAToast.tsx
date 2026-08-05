import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PWAToast() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  const [showUpdate, setShowUpdate] = needRefresh

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-[100] flex items-center gap-3 rounded-2xl border border-border/50 bg-surface/80 p-4 shadow-2xl backdrop-blur-xl"
        >
          <RefreshCw size={16} className="text-workspace" />
          <span className="text-sm font-medium text-text">
            A new version of FinanceOS is available.
          </span>
          <button
            onClick={() => {
              setShowUpdate(false)
              updateServiceWorker()
            }}
            className="rounded-lg bg-workspace px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:opacity-90"
          >
            Update
          </button>
          <button
            onClick={() => setShowUpdate(false)}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-border"
          >
            Later
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
