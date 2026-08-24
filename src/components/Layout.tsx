import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { MobileSidebar } from '../components/MobileSidebar'
import { Header } from '../components/Header'
import { useTheme } from '../app/providers/ThemeContext'

export function Layout() {
  const { theme } = useTheme()

  useEffect(() => {
    console.log('Layout rendered, theme:', theme)
  }, [theme])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar open={false} onClose={() => {}} />
      <div className="flex-1 md:ml-64">
        <div className="hidden md:block">
          <Header />
        </div>

        {/* MOBILE COMPONENTS TEMPORARILY DISABLED FOR TESTING */}

        <main className="p-4 sm:p-6 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
