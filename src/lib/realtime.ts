import { supabase, isSupabaseConfigured } from './supabase'
import type { WorkspaceId } from './types'

interface RealtimeState {
  channel: ReturnType<typeof supabase.channel> | null
  workspace: WorkspaceId | null
  callback: (() => void) | null
  reconnectTimeout: ReturnType<typeof setTimeout> | null
  reconnectAttempts: number
  generation: number
}

const state: RealtimeState = {
  channel: null,
  workspace: null,
  callback: null,
  reconnectTimeout: null,
  reconnectAttempts: 0,
  generation: 0,
}

const MAX_RECONNECT_ATTEMPTS = 5
const BASE_RECONNECT_DELAY_MS = 1000

interface TableSubscription {
  name: string
  filterColumn: string
}

const TABLES: TableSubscription[] = [
  { name: 'transactions', filterColumn: 'workspace' },
  { name: 'bills', filterColumn: 'workspace' },
  { name: 'money_pockets', filterColumn: 'workspace' },
  { name: 'notifications', filterColumn: 'workspace' },
  { name: 'accounts', filterColumn: 'workspace' },
  { name: 'budgets', filterColumn: 'workspace' },
]

function createChannel(
  workspace: WorkspaceId,
  onUpdate: () => void
): void {
  if (!isSupabaseConfigured) return

  if (state.channel) {
    supabase.removeChannel(state.channel)
    state.channel = null
  }

  const gen = state.generation
  state.channel = supabase.channel(`realtime:workspace:${workspace}`)

  TABLES.forEach(({ name: table, filterColumn }) => {
    state.channel!.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `${filterColumn}=eq.${workspace}`,
      },
      () => {
        onUpdate()
      }
    )
  })

  state.channel!.subscribe((status) => {
    if (gen !== state.generation) return

    if (status === 'SUBSCRIBED') {
      state.reconnectAttempts = 0
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      state.channel = null

      if (state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay =
          BASE_RECONNECT_DELAY_MS * Math.pow(2, state.reconnectAttempts)
        state.reconnectAttempts++
        const timeoutGen = state.generation
        state.reconnectTimeout = setTimeout(() => {
          state.reconnectTimeout = null
          if (timeoutGen !== state.generation) return
          createChannel(workspace, onUpdate)
        }, delay)
      } else {
        console.error(
          'Realtime: max reconnection attempts reached, giving up'
        )
      }
    }
  })
}

export function setupRealtimeSubscriptions(
  workspace: WorkspaceId,
  onUpdate: () => void
): void {
  if (!isSupabaseConfigured) return

  if (state.workspace === workspace && state.channel) {
    return
  }

  cleanupRealtimeSubscriptions()

  state.workspace = workspace
  state.callback = onUpdate
  createChannel(workspace, onUpdate)
}

export function cleanupRealtimeSubscriptions(): void {
  state.generation++

  if (state.reconnectTimeout) {
    clearTimeout(state.reconnectTimeout)
    state.reconnectTimeout = null
  }
  state.reconnectAttempts = 0
  state.callback = null

  if (state.channel) {
    supabase.removeChannel(state.channel)
    state.channel = null
  }
  state.workspace = null
}
