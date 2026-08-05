import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Workspace, WorkspaceId } from '../../lib/types'
import { WORKSPACES } from '../../lib/data'
import { useDashboardStore } from '../store'
import { cleanupRealtimeSubscriptions } from '../../lib/realtime'

interface WorkspaceContextValue {
  workspaces: Workspace[]
  currentWorkspace: Workspace
  setWorkspace: (workspace: WorkspaceId) => void
  currency: Workspace['currency']
  theme: Workspace['theme']
  warningThreshold: number
  warningMessage: string
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
)

const WORKSPACE_STORAGE_KEY = 'finance-os-workspace'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace, setWorkspace: setStoreWorkspace, fetchWorkspaceData } =
    useDashboardStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-workspace', currentWorkspace)
  }, [currentWorkspace])

  useEffect(() => {
    fetchWorkspaceData()
    return () => {
      cleanupRealtimeSubscriptions()
    }
  }, [currentWorkspace])

  const currentWorkspaceData = useMemo(
    () => WORKSPACES.find((w: Workspace) => w.id === currentWorkspace) ?? WORKSPACES[0],
    [currentWorkspace]
  )

  const value = useMemo(
    () => ({
      workspaces: WORKSPACES,
      currentWorkspace: currentWorkspaceData,
      setWorkspace: (workspace: WorkspaceId) => {
        setStoreWorkspace(workspace)
        if (mounted) {
          localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace)
        }
      },
      currency: currentWorkspaceData.currency,
      theme: currentWorkspaceData.theme,
      warningThreshold: currentWorkspaceData.warningThreshold,
      warningMessage: currentWorkspaceData.warningMessage,
    }),
    [currentWorkspaceData, setStoreWorkspace, mounted]
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
