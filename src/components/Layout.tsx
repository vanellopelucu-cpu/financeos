import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <main className="p-6 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
