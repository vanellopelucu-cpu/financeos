import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export type NotificationType =
  | 'expense'
  | 'income'
  | 'bill'
  | 'transfer'
  | 'savings'
  | 'system'
  | 'low_balance'

export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  amount?: number
  currencyCode?: 'LKR' | 'IDR'
  timestamp: string
  priority: NotificationPriority
  read: boolean
  icon: string
}

export interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  removeNotification: (id: string) => void
  clearRead: () => void
  unreadCount: number
  fetchNotifications: (workspaceId: string) => Promise<void>
}

const getMockNotifications = (workspaceId: string): Notification[] => {
  const now = new Date()
  const formatTime = (minsAgo: number): string => {
    const date = new Date(now.getTime() - minsAgo * 60000)
    return date.toISOString()
  }

  if (workspaceId === 'srilanka') {
    return [
      {
        id: 'notif-1',
        type: 'expense',
        title: 'Expense Recorded',
        description: 'Coffee purchase at Daily Grind Cafe',
        amount: 1200,
        currencyCode: 'LKR',
        timestamp: formatTime(2),
        priority: 'low',
        read: false,
        icon: '☕',
      },
      {
        id: 'notif-2',
        type: 'bill',
        title: 'Bill Reminder',
        description: 'Electricity bill of Rs 4,500 is due tomorrow',
        amount: 4500,
        currencyCode: 'LKR',
        timestamp: formatTime(15),
        priority: 'high',
        read: false,
        icon: '💡',
      },
      {
        id: 'notif-3',
        type: 'savings',
        title: 'Savings Goal Achieved',
        description: 'Emergency Fund pocket reached target of Rs 85,000',
        timestamp: formatTime(45),
        priority: 'medium',
        read: false,
        icon: '🐷',
      },
      {
        id: 'notif-4',
        type: 'income',
        title: 'Income Received',
        description: 'Salary deposit of Rs 125,000 received',
        amount: 125000,
        currencyCode: 'LKR',
        timestamp: formatTime(120),
        priority: 'medium',
        read: true,
        icon: '💰',
      },
      {
        id: 'notif-5',
        type: 'transfer',
        title: 'Transfer Completed',
        description: 'Transferred Rs 50,000 to Savings Account',
        amount: 50000,
        currencyCode: 'LKR',
        timestamp: formatTime(180),
        priority: 'low',
        read: true,
        icon: '🔁',
      },
      {
        id: 'notif-6',
        type: 'low_balance',
        title: 'Low Balance Warning',
        description: 'Available balance is below Rs 20,000 threshold',
        timestamp: formatTime(240),
        priority: 'high',
        read: true,
        icon: '⚠️',
      },
    ]
  }

  return [
    {
      id: 'notif-1',
      type: 'expense',
      title: 'Expense Recorded',
      description: 'Coffee purchase at Daily Grind Cafe',
      amount: 45000,
      currencyCode: 'IDR',
      timestamp: formatTime(2),
      priority: 'low',
      read: false,
      icon: '☕',
    },
    {
      id: 'notif-2',
      type: 'bill',
      title: 'Bill Reminder',
      description: 'Electricity bill of Rp 450,000 is due tomorrow',
      amount: 450000,
      currencyCode: 'IDR',
      timestamp: formatTime(15),
      priority: 'high',
      read: false,
      icon: '💡',
    },
    {
      id: 'notif-3',
      type: 'savings',
      title: 'Savings Goal Achieved',
      description: 'Emergency Fund pocket reached target of Rp 3,200,000',
      timestamp: formatTime(45),
      priority: 'medium',
      read: false,
      icon: '🐷',
    },
    {
      id: 'notif-4',
      type: 'income',
      title: 'Income Received',
      description: 'Salary deposit of Rp 8,500,000 received',
      amount: 8500000,
      currencyCode: 'IDR',
      timestamp: formatTime(120),
      priority: 'medium',
      read: true,
      icon: '💰',
    },
    {
      id: 'notif-5',
      type: 'transfer',
      title: 'Transfer Completed',
      description: 'Transferred Rp 3,000,000 to Savings Account',
      amount: 3000000,
      currencyCode: 'IDR',
      timestamp: formatTime(180),
      priority: 'low',
      read: true,
      icon: '🔁',
    },
    {
      id: 'notif-6',
      type: 'low_balance',
      title: 'Low Balance Warning',
      description: 'Available balance is below Rp 5,000,000 threshold',
      timestamp: formatTime(240),
      priority: 'high',
      read: true,
      icon: '⚠️',
    },
  ]
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },
      markAsRead: (id) => {
        useNotificationStore.getState().markNotificationAsRead(id)
      },
      markAllAsRead: () => {
        useNotificationStore.getState().markAllNotificationsAsRead()
      },
      markNotificationAsRead: async (id) => {
        try {
          if (isSupabaseConfigured) {
            const { error } = await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', id)
            if (error) {
              console.error('Failed to mark notification as read:', error)
            }
          }
        } catch (err) {
          console.error('Error marking notification as read:', err)
        }

        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },
      markAllNotificationsAsRead: async () => {
        try {
          if (isSupabaseConfigured) {
            const { error } = await supabase
              .from('notifications')
              .update({ read: true })
              .eq('read', false)
            if (error) {
              console.error('Failed to mark all notifications as read:', error)
            }
          }
        } catch (err) {
          console.error('Error marking all notifications as read:', err)
        }

        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearRead: () =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.read),
        })),
      get unreadCount() {
        return get().notifications.filter((n) => !n.read).length
      },

      fetchNotifications: async (workspaceId) => {
        if (!isSupabaseConfigured) {
          const mockNotifications = getMockNotifications(workspaceId)
          const mapped = mockNotifications.map((n) => ({
            ...n,
            id: n.id,
          }))
          set({ notifications: mapped })
          return
        }

        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('id, type, title, description, amount, currency_code, timestamp, priority, read, icon')
            .eq('workspace', workspaceId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Failed to fetch notifications:', error)
            const mockNotifications = getMockNotifications(workspaceId)
            set({ notifications: mockNotifications })
            return
          }

          if (data) {
            const mapped: Notification[] = data.map((row: any) => ({
              id: row.id,
              type: row.type as NotificationType,
              title: row.title,
              description: row.description,
              amount: row.amount ? Number(row.amount) : undefined,
              currencyCode: row.currency_code as 'LKR' | 'IDR' | undefined,
              timestamp: row.timestamp,
              priority: row.priority as NotificationPriority,
              read: row.read,
              icon: row.icon,
            }))
            set({ notifications: mapped })
          }
        } catch (err) {
          console.error('Error fetching notifications:', err)
          const mockNotifications = getMockNotifications(workspaceId)
          set({ notifications: mockNotifications })
        }
      },
    })
  )
)

export async function initializeNotifications(workspaceId: string) {
  await useNotificationStore.getState().fetchNotifications(workspaceId)
}
