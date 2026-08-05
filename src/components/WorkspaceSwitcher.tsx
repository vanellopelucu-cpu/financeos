import { ChevronDown } from 'lucide-react'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import type { Workspace } from '../lib/types'
import { cn } from '../lib/utils'

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setWorkspace } = useWorkspace()

  return (
    <div className="relative">
      <select
        value={currentWorkspace.id}
        onChange={(e) => setWorkspace(e.target.value as typeof currentWorkspace.id)}
        className={cn(
          'appearance-none w-full cursor-pointer rounded-2xl border border-border bg-secondary px-3 py-2.5 text-sm font-medium text-text transition-all duration-300 hover:bg-primary-200/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
        )}
      >
        {workspaces.map((ws: Workspace) => (
          <option key={ws.id} value={ws.id}>
            {ws.name} ({ws.currency.symbol})
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
      />
    </div>
  )
}
