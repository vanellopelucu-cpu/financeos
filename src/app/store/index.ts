import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { setupRealtimeSubscriptions, cleanupRealtimeSubscriptions } from '../../lib/realtime'
import type {
  Account,
  AnalyticsData,
  BalanceInfo,
  Bill,
  BudgetCategory,
  CategorySpending,
  MoneyPocket,
  Transaction,
  Workspace,
  WorkspaceId,
} from '../../lib/types'
import { DASHBOARD_DATA, WORKSPACES } from '../../lib/data'
import { getCategoryIcon } from '../../lib/utils'
import { useNotificationStore } from './notifications'

export interface DashboardState {
  currentWorkspace: WorkspaceId
  balance: BalanceInfo
  analytics: AnalyticsData
  upcomingBills: Bill[]
  moneyPockets: MoneyPocket[]
  transactions: Transaction[]
  workspaces: Workspace[]
  accounts: Account[]
  budgets: BudgetCategory[]
  searchQuery: string

  setWorkspace: (workspace: WorkspaceId) => void
  setSearchQuery: (query: string) => void
  fetchWorkspaceData: () => Promise<void>
  fetchTransactions: () => Promise<void>
  fetchBills: () => Promise<void>
  fetchMoneyPockets: () => Promise<void>
  fetchAccounts: () => Promise<void>
  fetchAnalytics: () => Promise<void>
  fetchBudgets: () => Promise<void>
   addPocket: (pocket: Omit<MoneyPocket, 'id'>) => Promise<{ success: boolean; error?: string }>
  editPocket: (id: string, pocket: Partial<Omit<MoneyPocket, 'id'>>) => Promise<{ success: boolean; error?: string }>
  deletePocket: (id: string) => Promise<{ success: boolean; error?: string }>
  addBill: (bill: Omit<Bill, 'id'>) => Promise<{ success: boolean; error?: string }>
  editBill: (id: string, bill: Partial<Omit<Bill, 'id'>>) => Promise<{ success: boolean; error?: string }>
  deleteBill: (id: string) => Promise<{ success: boolean; error?: string }>
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<{ success: boolean; error?: string }>
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => {
        return {
        currentWorkspace: 'indonesia',
        balance: DASHBOARD_DATA.balance['indonesia'],
        analytics: DASHBOARD_DATA.analytics['indonesia'],
        upcomingBills: DASHBOARD_DATA.upcomingBills['indonesia'],
        moneyPockets: DASHBOARD_DATA.moneyPockets['indonesia'],
        transactions: DASHBOARD_DATA.transactions['indonesia'],
         workspaces: WORKSPACES,
        accounts: DASHBOARD_DATA.accounts['indonesia'],
        budgets: DASHBOARD_DATA.budgets['indonesia'],
        searchQuery: '',

        setWorkspace: (workspace) => {
          cleanupRealtimeSubscriptions()
          const data = DASHBOARD_DATA
          set({
            currentWorkspace: workspace,
            balance: data.balance[workspace],
            analytics: data.analytics[workspace],
            upcomingBills: data.upcomingBills[workspace],
            moneyPockets: data.moneyPockets[workspace],
             accounts: data.accounts[workspace],
             budgets: data.budgets[workspace],
            searchQuery: '',
          })
        },

        setSearchQuery: (query) => set({ searchQuery: query }),

        fetchWorkspaceData: async () => {
          await get().fetchTransactions()
          await get().fetchBills()
          await get().fetchMoneyPockets()
          await get().fetchAccounts()
          await get().fetchAnalytics()
          await get().fetchBudgets()
          await useNotificationStore
            .getState()
            .fetchNotifications(get().currentWorkspace)
          setupRealtimeSubscriptions(get().currentWorkspace, () =>
            get().fetchWorkspaceData()
          )
        },

        fetchTransactions: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              transactions: DASHBOARD_DATA.transactions[workspace],
            })
            return
          }

          try {
            const { data, error } = await supabase
              .from('transactions')
              .select('id, description, category, date, amount, icon, created_at')
              .eq('workspace', workspace)
              .order('created_at', { ascending: false })
              .order('date', { ascending: false })
              .order('id', { ascending: false })

            if (error) {
              console.error('Failed to fetch transactions:', error)
              set({
                transactions: DASHBOARD_DATA.transactions[workspace],
              })
              return
            }

            if (data) {
              const mapped: Transaction[] = data.map((row: any) => ({
                id: row.id,
                description: row.description,
                category: row.category,
                date: row.date,
                amount: Number(row.amount),
                icon: row.icon,
                createdAt: row.created_at,
              }))
              set({ transactions: mapped })
            }
          } catch (err) {
            console.error('Error fetching transactions:', err)
            set({
              transactions: DASHBOARD_DATA.transactions[workspace],
            })
          }
        },

        fetchBills: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              upcomingBills: DASHBOARD_DATA.upcomingBills[workspace],
            })
            return
          }

          try {
            const { data, error } = await supabase
              .from('bills')
              .select('id, title, amount, due_date, icon, provider, status')
              .eq('workspace', workspace)
              .order('due_date', { ascending: true })

            if (error) {
              console.error('Failed to fetch bills:', error)
              set({
                upcomingBills: DASHBOARD_DATA.upcomingBills[workspace],
              })
              return
            }

            if (data) {
              const mapped: Bill[] = data.map((row: any) => ({
                id: row.id,
                title: row.title,
                amount: Number(row.amount),
                dueDate: row.due_date,
                icon: row.icon,
                provider: row.provider,
                status: row.status || 'unpaid',
                recurring: row.recurring || false,
                category: row.category || null,
              }))
              set({ upcomingBills: mapped })
            }
          } catch (err) {
            console.error('Error fetching bills:', err)
            set({
              upcomingBills: DASHBOARD_DATA.upcomingBills[workspace],
            })
          }
        },

        fetchMoneyPockets: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              moneyPockets: DASHBOARD_DATA.moneyPockets[workspace],
            })
            return
          }

          try {
            const { data, error } = await supabase
              .from('money_pockets')
              .select('id, name, icon, current_amount, target_amount, status')
              .eq('workspace', workspace)
              .order('created_at', { ascending: true })

            if (error) {
              console.error('Failed to fetch money pockets:', error)
              set({
                moneyPockets: DASHBOARD_DATA.moneyPockets[workspace],
              })
              return
            }

            if (data) {
              const mapped: MoneyPocket[] = data.map((row: any) => ({
                id: row.id,
                name: row.name,
                icon: row.icon,
                currentAmount: Number(row.current_amount),
                targetAmount: Number(row.target_amount),
                status: row.status,
              }))
              set({ moneyPockets: mapped })
            }
          } catch (err) {
            console.error('Error fetching money pockets:', err)
            set({
              moneyPockets: DASHBOARD_DATA.moneyPockets[workspace],
            })
          }
        },

        addPocket: async (pocket) => {
          const workspace = get().currentWorkspace
          const normalizedName = pocket.name.trim()

          const existing = get().moneyPockets.find((p) => p.name.toLowerCase() === normalizedName.toLowerCase())
          if (existing) {
            return { success: false, error: 'This pocket already exists.' }
          }

          if (!isSupabaseConfigured) {
            const { moneyPockets } = get()
            const newPocket: MoneyPocket = {
              id: `temp-${Date.now()}`,
              ...pocket,
            }
            set({ moneyPockets: [...moneyPockets, newPocket] })
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('money_pockets')
              .insert({
                workspace,
                name: normalizedName,
                icon: pocket.icon || '💰',
                current_amount: pocket.currentAmount,
                target_amount: pocket.targetAmount,
                status: pocket.status,
              })

            if (error) {
              console.error('Failed to add pocket:', error)
              return { success: false, error: 'Failed to add pocket.' }
            }

            await get().fetchMoneyPockets()
            return { success: true }
          } catch (err) {
            console.error('Error adding pocket:', err)
            return { success: false, error: 'Failed to add pocket.' }
          }
        },

        editPocket: async (id, pocket) => {
          if (!isSupabaseConfigured) {
            const { moneyPockets } = get()
            const updated = moneyPockets.map((p) =>
              p.id === id ? { ...p, ...pocket } : p
            )
            set({ moneyPockets: updated })
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('money_pockets')
              .update({
                name: pocket.name,
                icon: pocket.icon,
                current_amount: pocket.currentAmount,
                target_amount: pocket.targetAmount,
                status: pocket.status,
              })
              .eq('id', id)

            if (error) {
              console.error('Failed to edit pocket:', error)
              return { success: false, error: 'Failed to edit pocket.' }
            }

            await get().fetchMoneyPockets()
            return { success: true }
          } catch (err) {
            console.error('Error editing pocket:', err)
            return { success: false, error: 'Failed to edit pocket.' }
          }
        },

        deletePocket: async (id) => {
          if (!isSupabaseConfigured) {
            const { moneyPockets } = get()
            set({ moneyPockets: moneyPockets.filter((p) => p.id !== id) })
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('money_pockets')
              .delete()
              .eq('id', id)

            if (error) {
              console.error('Failed to delete pocket:', error)
              return { success: false, error: 'Failed to delete pocket.' }
            }

            await get().fetchMoneyPockets()
            return { success: true }
          } catch (err) {
            console.error('Error deleting pocket:', err)
            return { success: false, error: 'Failed to delete pocket.' }
          }
        },

        addBill: async (bill) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            const { upcomingBills } = get()
            const newBill: Bill = {
              id: `temp-${Date.now()}`,
              ...bill,
            }
            set({ upcomingBills: [...upcomingBills, newBill] })
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('bills')
              .insert({
                workspace,
                title: bill.title,
                amount: bill.amount,
                currency: WORKSPACES.find((w) => w.id === workspace)?.currency.code || 'IDR',
                due_date: bill.dueDate,
                status: bill.status || 'unpaid',
                icon: bill.icon || '📄',
                provider: bill.provider || null,
              })

            if (error) {
              console.error('Failed to add bill:', error)
              return { success: false, error: 'Failed to add bill.' }
            }

            await get().fetchBills()
            return { success: true }
          } catch (err) {
            console.error('Error adding bill:', err)
            return { success: false, error: 'Failed to add bill.' }
          }
        },

        editBill: async (id, bill) => {
          if (!isSupabaseConfigured) {
            const { upcomingBills } = get()
            const updated = upcomingBills.map((b) =>
              b.id === id ? { ...b, ...bill } : b
            )
            set({ upcomingBills: updated })
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('bills')
              .update({
                title: bill.title,
                amount: bill.amount,
                due_date: bill.dueDate,
                status: bill.status,
                icon: bill.icon,
                provider: bill.provider,
              })
              .eq('id', id)

            if (error) {
              console.error('Failed to edit bill:', error)
              return { success: false, error: 'Failed to edit bill.' }
            }

            await get().fetchBills()
            return { success: true }
          } catch (err) {
            console.error('Error editing bill:', err)
            return { success: false, error: 'Failed to edit bill.' }
          }
        },

        deleteBill: async (id) => {
          if (!isSupabaseConfigured) {
            const { upcomingBills } = get()
            set({ upcomingBills: upcomingBills.filter((b) => b.id !== id) })
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('bills')
              .delete()
              .eq('id', id)

            if (error) {
              console.error('Failed to delete bill:', error)
              return { success: false, error: 'Failed to delete bill.' }
            }

             await get().fetchBills()
            return { success: true }
          } catch (err) {
            console.error('Error deleting bill:', err)
            return { success: false, error: 'Failed to delete bill.' }
          }
        },

        addTransaction: async (transaction) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            const { transactions } = get()
            const newTransaction: Transaction = {
              id: `tx-temp-${Date.now()}`,
              ...transaction,
            }
            set({ transactions: [newTransaction, ...transactions] })

            set((state) => ({
              balance: {
                ...state.balance,
                income:
                  transaction.amount >= 0
                    ? state.balance.income + transaction.amount
                    : state.balance.income,
                expenses:
                  transaction.amount < 0
                    ? state.balance.expenses + Math.abs(transaction.amount)
                    : state.balance.expenses,
                availableBalance: state.balance.availableBalance + transaction.amount,
                remaining: state.balance.remaining + transaction.amount,
              },
            }))

            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('transactions')
              .insert({
                workspace,
                description: transaction.description,
                category: transaction.category,
                date: transaction.date,
                amount: transaction.amount,
                icon: transaction.icon,
              })

            if (error) {
              console.error('Failed to add transaction:', error)
              return { success: false, error: 'Failed to save transaction.' }
            }

            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('available_balance')
              .eq('workspace', workspace)
              .single()

            if (!profileError && profileData) {
              const currentBalance = Number(profileData.available_balance)
              const newBalance = currentBalance + transaction.amount

              await supabase
                .from('profiles')
                .update({ available_balance: newBalance })
                .eq('workspace', workspace)
            }

            await get().fetchTransactions()
            await get().fetchAnalytics()

            return { success: true }
          } catch (err) {
            console.error('Error adding transaction:', err)
            return { success: false, error: 'Failed to save transaction.' }
          }
        },

        fetchAccounts: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              accounts: DASHBOARD_DATA.accounts[workspace],
            })
            return
          }

          try {
            const { data, error } = await supabase
              .from('accounts')
              .select('id, name, type, icon, account_number, balance, status, last_updated')
              .eq('workspace', workspace)
              .order('created_at', { ascending: true })

            if (error) {
              console.error('Failed to fetch accounts:', error)
              set({
                accounts: DASHBOARD_DATA.accounts[workspace],
              })
              return
            }

            if (data) {
              const mapped: Account[] = data.map((row: any) => ({
                id: row.id,
                name: row.name,
                type: row.type,
                icon: row.icon,
                accountNumber: row.account_number,
                balance: Number(row.balance),
                status: row.status,
                lastUpdated: row.last_updated,
              }))
              set({ accounts: mapped })
            }
          } catch (err) {
            console.error('Error fetching accounts:', err)
            set({
              accounts: DASHBOARD_DATA.accounts[workspace],
            })
          }
        },

        fetchAnalytics: async () => {
          const workspace = get().currentWorkspace
          const mockAnalytics = DASHBOARD_DATA.analytics[workspace]
          const mockBalance = DASHBOARD_DATA.balance[workspace]

          if (!isSupabaseConfigured) {
            set({
              analytics: mockAnalytics,
              balance: {
                ...get().balance,
                ...mockBalance,
              },
            })
            return
          }

          try {
            const { data: balanceRow, error: balanceError } = await supabase
              .from('profiles')
              .select(
                'available_balance, income, expenses, remaining, safe_spending, total_balance'
              )
              .eq('workspace', workspace)
              .single()

            if (balanceError) {
              console.error('Failed to fetch balances:', balanceError)
            }

            const transactions = get().transactions
            const moneyPockets = get().moneyPockets

            const totalIncome = transactions
              .filter((t) => t.amount >= 0)
              .reduce((sum, t) => sum + t.amount, 0)

            const totalExpense = transactions
              .filter((t) => t.amount < 0)
              .reduce((sum, t) => sum + Math.abs(t.amount), 0)

            const remainingBudget = totalIncome - totalExpense

            const availableBalance = balanceRow
              ? Number(balanceRow.available_balance)
              : get().balance.availableBalance

            const savingsRate =
              totalIncome > 0 ? Math.round((remainingBudget / totalIncome) * 100) : 0

            let healthScore: number
            if (savingsRate >= 50) healthScore = 85
            else if (savingsRate >= 30) healthScore = 78
            else if (savingsRate >= 20) healthScore = 65
            else healthScore = 45

            const now = new Date()
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
            const monthlyTransactions = transactions.filter((t) =>
              t.date.startsWith(currentMonthStr)
            )
            const monthlyIncome = monthlyTransactions
              .filter((t) => t.amount >= 0)
              .reduce((sum, t) => sum + t.amount, 0)
            const monthlyExpenses = monthlyTransactions
              .filter((t) => t.amount < 0)
              .reduce((sum, t) => sum + Math.abs(t.amount), 0)
            const monthlyCashflow = monthlyIncome - monthlyExpenses

            const categoryTotals: Record<string, number> = {}
            transactions
              .filter((t) => t.amount < 0)
              .forEach((t) => {
                categoryTotals[t.category] =
                  (categoryTotals[t.category] || 0) + Math.abs(t.amount)
              })

            const totalSpent = Object.values(categoryTotals).reduce(
              (sum, v) => sum + v,
              0
            )
            const categorySpending: CategorySpending[] = Object.entries(
              categoryTotals
            )
              .map(([category, amount]) => ({
                category,
                amount,
                percentage:
                  totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
                icon: getCategoryIcon(category),
              }))
              .sort((a, b) => b.amount - a.amount)

            const budgetProgress = moneyPockets.map((p) =>
              Math.min(100, (p.currentAmount / p.targetAmount) * 100)
            )

            const analyticsData: AnalyticsData = {
              availableBalance,
              totalIncome,
              totalExpense,
              remainingBudget,
              monthlyCashflow,
              healthScore,
              savingsRate,
              categorySpending,
              budgetProgress,
            }

            set({
              analytics: analyticsData,
              balance: {
                ...get().balance,
                income: totalIncome,
                expenses: totalExpense,
                remaining: remainingBudget,
                availableBalance,
              },
            })
          } catch (err) {
            console.error('Error calculating analytics:', err)
            set({
              analytics: mockAnalytics,
              balance: {
                ...get().balance,
                ...mockBalance,
              },
            })
          }
        },

        fetchBudgets: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              budgets: DASHBOARD_DATA.budgets[workspace],
            })
            return
          }

          try {
            const { data, error } = await supabase
              .from('budgets')
              .select('id, category, monthly_limit, current_spent, color, icon')
              .eq('workspace', workspace)
              .order('category', { ascending: true })

            if (error) {
              console.error('Failed to fetch budgets:', error)
              set({
                budgets: DASHBOARD_DATA.budgets[workspace],
              })
              return
            }

            if (data) {
              const mapped: BudgetCategory[] = data.map((row: any) => ({
                id: row.id,
                name: row.category,
                icon: row.icon || getCategoryIcon(row.category),
                allocated: Number(row.monthly_limit),
                spent: Number(row.current_spent),
              }))
              set({ budgets: mapped })
            }
          } catch (err) {
            console.error('Error fetching budgets:', err)
            set({
              budgets: DASHBOARD_DATA.budgets[workspace],
            })
          }
        },
      }},
      { name: 'finance-os-storage' }
    )
  )
)
