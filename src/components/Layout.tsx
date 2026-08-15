import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { MobileSidebar } from '../components/MobileSidebar'
import { cn } from '../lib/utils'

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md md:hidden">
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-text-secondary transition-all duration-300 hover:bg-border'
            )}
          >
            <Menu size={18} />
          </button>
          <span className="text-lg font-bold text-text">FinanceOS</span>
        </header>
        <main className="p-6 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
