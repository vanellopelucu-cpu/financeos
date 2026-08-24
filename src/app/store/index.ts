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
  Credit,
  CreditReceipt,
  CreditStatus,
  Debt,
  DebtPayment,
  DebtStatus,
  MoneyPocket,
  Transaction,
  Workspace,
  WorkspaceId,
} from '../../lib/types'
import { DASHBOARD_DATA, WORKSPACES } from '../../lib/data'
import { getCategoryIcon } from '../../lib/utils'
import { useNotificationStore } from './notifications'

function parseJsonSafe(val: unknown): Record<string, any> {
  if (!val) return {}
  if (typeof val === 'object' && !Array.isArray(val)) return val as Record<string, any>
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return {}
    }
  }
  return {}
}

function computeDebtStatus(remaining: number, total: number): DebtStatus {
  if (remaining <= 0) return 'paid'
  if (remaining < total) return 'partial'
  return 'unpaid'
}

function computeCreditStatus(remaining: number, total: number): CreditStatus {
  if (remaining <= 0) return 'received'
  if (remaining < total) return 'partial'
  return 'unreceived'
}

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
  debts: Debt[]
  credits: Credit[]
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
  fetchDebts: () => Promise<void>
  fetchCredits: () => Promise<void>
  addPocket: (pocket: Omit<MoneyPocket, 'id'>) => Promise<{ success: boolean; error?: string }>
  editPocket: (id: string, pocket: Partial<Omit<MoneyPocket, 'id'>>) => Promise<{ success: boolean; error?: string }>
  deletePocket: (id: string) => Promise<{ success: boolean; error?: string }>
  addToPocket: (pocket: MoneyPocket, amount: number) => Promise<{ success: boolean; error?: string }>
  withdrawFromPocket: (pocket: MoneyPocket, amount: number) => Promise<{ success: boolean; error?: string }>
   addBill: (bill: Omit<Bill, 'id'>) => Promise<{ success: boolean; error?: string }>
  editBill: (id: string, bill: Partial<Omit<Bill, 'id'>>) => Promise<{ success: boolean; error?: string }>
  deleteBill: (id: string) => Promise<{ success: boolean; error?: string }>
  payBill: (bill: Bill, paidDate: string) => Promise<{ success: boolean; error?: string }>
  unpayBill: (bill: Bill) => Promise<{ success: boolean; error?: string }>
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<{ success: boolean; error?: string }>
  addDebt: (debt: Omit<Debt, 'id' | 'payments'>) => Promise<{ success: boolean; error?: string }>
  editDebt: (id: string, debt: Partial<Omit<Debt, 'id' | 'payments'>>) => Promise<{ success: boolean; error?: string }>
  deleteDebt: (id: string) => Promise<{ success: boolean; error?: string }>
  payDebt: (debt: Debt, amount: number, paymentDate: string, note?: string) => Promise<{ success: boolean; error?: string }>
  addCredit: (credit: Omit<Credit, 'id' | 'receipts'>) => Promise<{ success: boolean; error?: string }>
  editCredit: (id: string, credit: Partial<Omit<Credit, 'id' | 'receipts'>>) => Promise<{ success: boolean; error?: string }>
  deleteCredit: (id: string) => Promise<{ success: boolean; error?: string }>
  receiveCredit: (credit: Credit, amount: number, receiptDate: string, note?: string) => Promise<{ success: boolean; error?: string }>
  clearAllDebtsAndCredits: () => Promise<{ success: boolean; error?: string }>
  clearAllData: () => Promise<{ success: boolean; error?: string }>
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
         debts: DASHBOARD_DATA.debts['indonesia'],
         credits: DASHBOARD_DATA.credits['indonesia'],
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
            transactions: data.transactions[workspace],
            workspaces: WORKSPACES,
            accounts: data.accounts[workspace],
            budgets: data.budgets[workspace],
            debts: data.debts[workspace],
            credits: data.credits[workspace],
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
          await get().fetchDebts()
          await get().fetchCredits()
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
                  console.warn('Failed to fetch transactions from Supabase, preserving current state:', error.message)
                  set({ transactions: DASHBOARD_DATA.transactions[workspace] || [] })
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
              console.warn('Error fetching transactions from Supabase, preserving current state:', err)
              set({ transactions: [] })
            }
        },

         fetchBills: async () => {
           const workspace = get().currentWorkspace

            if (!isSupabaseConfigured) {
              const mockBills = DASHBOARD_DATA.upcomingBills[workspace]
              const now = new Date()
              const computed = mockBills.map((bill) => {
                if (bill.status === 'paid') return bill
                const dueDate = new Date(bill.dueDate)
                if (now > dueDate) return { ...bill, status: 'overdue' as const }
                return bill
              })
              set({
                upcomingBills: computed,
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
                 console.warn('Failed to fetch bills from Supabase, preserving current state:', error.message)
                 set({ upcomingBills: DASHBOARD_DATA.upcomingBills[workspace] || [] })
                 return
               }

              if (data) {
                const now = new Date()
                const mapped: Bill[] = data
                  .map((row: any) => {
                    let status: 'unpaid' | 'paid' | 'overdue' = row.status || 'unpaid'
                    let paidDate: string | undefined
                    let paymentTransactionId: string | undefined
                    let provider = row.provider || null

                    if (row.status === 'paid') {
                      try {
                        const parsed = JSON.parse(row.provider)
                        if (parsed && parsed.paidDate) {
                          paidDate = parsed.paidDate
                          paymentTransactionId = parsed.transactionId
                          provider = parsed.original || null
                        }
                      } catch (e) {
                        // provider is a plain string, not payment JSON
                      }
                    } else {
                      const dueDate = new Date(row.due_date)
                      if (now > dueDate) {
                        status = 'overdue'
                      }
                    }

                    return {
                      id: row.id,
                      title: row.title,
                      amount: Number(row.amount),
                      dueDate: row.due_date,
                      icon: row.icon,
                      provider,
                      status,
                      recurring: row.recurring || false,
                      category: row.category || null,
                      paidDate,
                      paymentTransactionId,
                    }
                  })
                  .filter((bill: Bill) => {
                    try {
                      const parsed = typeof bill.provider === 'string' ? JSON.parse(bill.provider) : bill.provider
                      if (parsed && (parsed.type === 'hutang' || parsed.type === 'piutang')) {
                        return false
                      }
                    } catch {
                      // provider is not JSON, keep the bill
                    }
                    return true
                  })
                set({ upcomingBills: mapped })
              }
            } catch (err) {
              console.warn('Error fetching bills from Supabase, preserving current state:', err)
              set({ upcomingBills: DASHBOARD_DATA.upcomingBills[workspace] || [] })
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
                console.warn('Failed to fetch money pockets from Supabase, preserving current state:', error.message)
                set({ moneyPockets: DASHBOARD_DATA.moneyPockets[workspace] || [] })
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
              console.warn('Error fetching money pockets from Supabase, preserving current state:', err)
              set({ moneyPockets: DASHBOARD_DATA.moneyPockets[workspace] || [] })
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

        addToPocket: async (pocket, amount) => {
          const workspace = get().currentWorkspace

          if (amount <= 0) {
            return { success: false, error: 'Amount must be greater than 0' }
          }

          if (!isSupabaseConfigured) {
            const { balance } = get()
            if (amount > balance.availableBalance) {
              return { success: false, error: 'Saldo tersedia tidak mencukupi.' }
            }
            set((state) => ({
              balance: { ...state.balance, availableBalance: state.balance.availableBalance - amount },
              moneyPockets: state.moneyPockets.map((p) =>
                p.id === pocket.id ? { ...p, currentAmount: p.currentAmount + amount } : p
              ),
            }))
            return { success: true }
          }

          try {
            let dbPocketId = pocket.id
            let currentPocketAmount = pocket.currentAmount

            if (pocket.id.startsWith('pocket-')) {
              const { data: existing } = await supabase
                .from('money_pockets')
                .select('id, current_amount')
                .eq('workspace', workspace)
                .eq('name', pocket.name)
                .single()

              if (existing) {
                dbPocketId = existing.id
                currentPocketAmount = Number(existing.current_amount)
              } else {
                const { data: created, error: createError } = await supabase
                  .from('money_pockets')
                  .insert({
                    workspace,
                    name: pocket.name,
                    icon: pocket.icon,
                    current_amount: pocket.currentAmount,
                    target_amount: pocket.targetAmount,
                    status: pocket.status,
                  })
                  .select('id, current_amount')
                  .single()

                if (createError || !created) {
                  return { success: false, error: 'Failed to create pocket record' }
                }
                dbPocketId = created.id
                currentPocketAmount = Number(created.current_amount)
              }
            }

            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('available_balance')
              .eq('workspace', workspace)
              .single()

            if (profileError || !profileData) {
              return { success: false, error: 'Failed to fetch balance' }
            }

            const availableBalance = Number(profileData.available_balance)

            if (amount > availableBalance) {
              return { success: false, error: 'Saldo tersedia tidak mencukupi.' }
            }

            const { error: balanceError } = await supabase
              .from('profiles')
              .update({ available_balance: availableBalance - amount })
              .eq('workspace', workspace)

            if (balanceError) {
              return { success: false, error: 'Failed to update balance' }
            }

            const { error: pocketError } = await supabase
              .from('money_pockets')
              .update({ current_amount: currentPocketAmount + amount })
              .eq('id', dbPocketId)

            if (pocketError) {
              await supabase
                .from('profiles')
                .update({ available_balance: availableBalance })
                .eq('workspace', workspace)
              return { success: false, error: 'Failed to update pocket' }
            }

            set((state) => ({
              balance: {
                ...state.balance,
                availableBalance: state.balance.availableBalance - amount,
              },
              moneyPockets: state.moneyPockets.map((p) =>
                p.id === pocket.id || p.id === dbPocketId
                  ? { ...p, id: dbPocketId, currentAmount: currentPocketAmount + amount }
                  : p
              ),
            }))

            await get().fetchAnalytics()
            await get().fetchMoneyPockets()

            return { success: true }
          } catch (err) {
            console.error('Error in addToPocket:', err)
            return { success: false, error: 'Failed to transfer funds' }
          }
        },

        withdrawFromPocket: async (pocket, amount) => {
          const workspace = get().currentWorkspace

          if (amount <= 0) {
            return { success: false, error: 'Amount must be greater than 0' }
          }

          if (!isSupabaseConfigured) {
            const { moneyPockets: localPockets } = get()
            const targetPocket = localPockets.find((p) => p.id === pocket.id)
            if (!targetPocket) {
              return { success: false, error: 'Pocket not found' }
            }
            if (amount > targetPocket.currentAmount) {
              return { success: false, error: 'Saldo Pocket tidak mencukupi.' }
            }
            set((state) => ({
              balance: {
                ...state.balance,
                availableBalance: state.balance.availableBalance + amount,
              },
              moneyPockets: state.moneyPockets.map((p) =>
                p.id === pocket.id ? { ...p, currentAmount: p.currentAmount - amount } : p
              ),
            }))
            return { success: true }
          }

          try {
            let dbPocketId = pocket.id

            if (pocket.id.startsWith('pocket-')) {
              const { data: existing } = await supabase
                .from('money_pockets')
                .select('id, current_amount')
                .eq('workspace', workspace)
                .eq('name', pocket.name)
                .single()

              if (existing) {
                dbPocketId = existing.id
              } else {
                const { data: created, error: createError } = await supabase
                  .from('money_pockets')
                  .insert({
                    workspace,
                    name: pocket.name,
                    icon: pocket.icon,
                    current_amount: pocket.currentAmount,
                    target_amount: pocket.targetAmount,
                    status: pocket.status,
                  })
                  .select('id, current_amount')
                  .single()

                if (createError || !created) {
                  return { success: false, error: 'Failed to create pocket record' }
                }
                dbPocketId = created.id
              }
            }

            const { data: pocketData, error: pocketFetchError } = await supabase
              .from('money_pockets')
              .select('current_amount')
              .eq('id', dbPocketId)
              .single()

            if (pocketFetchError || !pocketData) {
              return { success: false, error: 'Failed to fetch pocket balance' }
            }

            const pocketBalance = Number(pocketData.current_amount)

            if (amount > pocketBalance) {
              return { success: false, error: 'Saldo Pocket tidak mencukupi.' }
            }

            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('available_balance')
              .eq('workspace', workspace)
              .single()

            if (profileError || !profileData) {
              return { success: false, error: 'Failed to fetch balance' }
            }

            const availableBalance = Number(profileData.available_balance)

            const { error: pocketUpdateError } = await supabase
              .from('money_pockets')
              .update({ current_amount: pocketBalance - amount })
              .eq('id', dbPocketId)

            if (pocketUpdateError) {
              return { success: false, error: 'Failed to update pocket' }
            }

            const { error: balanceError } = await supabase
              .from('profiles')
              .update({ available_balance: availableBalance + amount })
              .eq('workspace', workspace)

            if (balanceError) {
              await supabase
                .from('money_pockets')
                .update({ current_amount: pocketBalance })
                .eq('id', dbPocketId)
              return { success: false, error: 'Failed to update balance' }
            }

            set((state) => ({
              balance: {
                ...state.balance,
                availableBalance: state.balance.availableBalance + amount,
              },
              moneyPockets: state.moneyPockets.map((p) =>
                p.id === pocket.id || p.id === dbPocketId
                  ? { ...p, id: dbPocketId, currentAmount: pocketBalance - amount }
                  : p
              ),
            }))

            await get().fetchAnalytics()
            await get().fetchMoneyPockets()

            return { success: true }
          } catch (err) {
            console.error('Error in withdrawFromPocket:', err)
            return { success: false, error: 'Failed to transfer funds' }
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

payBill: async (bill, paidDate) => {
            const workspace = get().currentWorkspace

            if (bill.status === 'paid') {
              return { success: false, error: 'Tagihan sudah dibayar.' }
            }

            if (!isSupabaseConfigured) {
              const { balance } = get()
              const availableBalance = balance.availableBalance
              if (bill.amount > availableBalance) {
                return { success: false, error: 'Saldo tersedia tidak mencukupi.' }
              }

              const { transactions } = get()
              const newTransaction: Transaction = {
                id: `tx-temp-${Date.now()}`,
                description: bill.title,
                category: 'Bills',
                date: paidDate,
                amount: -bill.amount,
                icon: bill.icon || '💡',
                billId: bill.id,
              }
              set({ transactions: [newTransaction, ...transactions] })

              const nextDueDate = bill.recurring
                ? new Date(new Date(bill.dueDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : bill.dueDate

              set((state) => ({
                balance: {
                  ...state.balance,
                  expenses: state.balance.expenses + bill.amount,
                  availableBalance: state.balance.availableBalance - bill.amount,
                },
                upcomingBills: state.upcomingBills.map((b) =>
                  b.id === bill.id
                    ? { ...b, status: 'paid' as const, paidDate, paymentTransactionId: newTransaction.id, dueDate: nextDueDate }
                    : b
                ),
              }))
              return { success: true }
            }

            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('available_balance')
                .eq('workspace', workspace)
                .single()

              if (profileError || !profileData) {
                console.error('payBill: Failed to fetch profile:', profileError?.message)
                return { success: false, error: 'Gagal memverifikasi saldo. Silakan coba lagi.' }
              }

              const availableBalance = Number(profileData.available_balance)
              if (bill.amount > availableBalance) {
                return { success: false, error: 'Saldo tersedia tidak mencukupi.' }
              }

              const { data: txData, error: txError } = await supabase
                .from('transactions')
                .insert({
                  workspace,
                  description: bill.title,
                  category: 'Bills',
                  date: paidDate,
                  amount: -bill.amount,
                  icon: bill.icon || '💡',
                })
                .select('id')
                .single()

              if (txError || !txData) {
                console.error('payBill: Failed to create transaction:', txError?.message)
                return { success: false, error: 'Gagal membuat transaksi pembayaran. Silakan coba lagi.' }
              }

              const paymentInfo = JSON.stringify({
                paidDate,
                transactionId: txData.id,
                original: bill.provider || null,
              })

              const nextDueDate = bill.recurring
                ? new Date(new Date(bill.dueDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : bill.dueDate

              const { error: billError } = await supabase
                .from('bills')
                .update({
                  status: 'paid',
                  provider: paymentInfo,
                  due_date: nextDueDate,
                })
                .eq('id', bill.id)
                .eq('workspace', workspace)

              if (billError) {
                await supabase.from('transactions').delete().eq('id', txData.id)
                console.error('payBill: Failed to update bill status:', billError.message)
                return { success: false, error: 'Gagal memperbarui status tagihan. Silakan coba lagi.' }
              }

              const { error: balanceError } = await supabase
                .from('profiles')
                .update({ available_balance: availableBalance - bill.amount })
                .eq('workspace', workspace)

              if (balanceError) {
                await supabase.from('bills').update({ status: 'unpaid', provider: bill.provider || null }).eq('id', bill.id).eq('workspace', workspace)
                await supabase.from('transactions').delete().eq('id', txData.id)
                console.error('payBill: Failed to update balance:', balanceError.message)
                return { success: false, error: 'Gagal memperbarui saldo. Silakan coba lagi.' }
              }

              const newTransaction: Transaction = {
                id: txData.id,
                description: bill.title,
                category: 'Bills',
                date: paidDate,
                amount: -bill.amount,
                icon: bill.icon || '💡',
                billId: bill.id,
              }

              set((state) => ({
                transactions: [newTransaction, ...state.transactions],
                balance: {
                  ...state.balance,
                  expenses: state.balance.expenses + bill.amount,
                  availableBalance: state.balance.availableBalance - bill.amount,
                },
                upcomingBills: state.upcomingBills.map((b) =>
                  b.id === bill.id
                    ? { ...b, status: 'paid' as const, paidDate, paymentTransactionId: txData.id, dueDate: nextDueDate }
                    : b
                ),
              }))

              await get().fetchAnalytics()

              return { success: true }
            } catch (err) {
              console.error('payBill: Unexpected error:', err)
              return { success: false, error: 'Gagal memproses pembayaran. Silakan coba lagi.' }
            }
          },

          unpayBill: async (bill) => {
            const workspace = get().currentWorkspace

            if (bill.status !== 'paid' || !bill.paymentTransactionId) {
              return { success: false, error: 'Tagihan belum dibayar.' }
            }

            if (!isSupabaseConfigured) {
              const { transactions } = get()
              const txId = bill.paymentTransactionId
              const tx = transactions.find((t) => t.id === txId)

              if (tx) {
                set({
                  transactions: transactions.filter((t) => t.id !== txId),
                })
                set((state) => ({
                  balance: {
                    ...state.balance,
                    expenses: state.balance.expenses - Math.abs(tx.amount),
                    availableBalance: state.balance.availableBalance + Math.abs(tx.amount),
                  },
                  upcomingBills: state.upcomingBills.map((b) =>
                    b.id === bill.id
                      ? { ...b, status: 'unpaid', paidDate: undefined, paymentTransactionId: undefined }
                      : b
                  ),
                }))
              }
              return { success: true }
            }

            try {
              const txId = bill.paymentTransactionId

              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('available_balance')
                .eq('workspace', workspace)
                .single()

              if (profileError || !profileData) {
                console.error('unpayBill: Failed to fetch profile:', profileError?.message)
                return { success: false, error: 'Gagal memverifikasi saldo. Silakan coba lagi.' }
              }

              const currentBalance = Number(profileData.available_balance)

              const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .eq('id', txId)
                .eq('workspace', workspace)

              if (txError) {
                console.error('unpayBill: Failed to delete transaction:', txError.message)
                return { success: false, error: 'Gagal menghapus transaksi pembayaran. Silakan coba lagi.' }
              }

              const { error: balanceError } = await supabase
                .from('profiles')
                .update({ available_balance: currentBalance + bill.amount })
                .eq('workspace', workspace)

              if (balanceError) {
                const paymentInfo = JSON.stringify({
                  paidDate: bill.paidDate,
                  transactionId: txId,
                  original: bill.provider,
                })
                await supabase
                  .from('bills')
                  .update({ status: 'paid', provider: paymentInfo })
                  .eq('id', bill.id)
                  .eq('workspace', workspace)
                console.error('unpayBill: Failed to update balance:', balanceError.message)
                return { success: false, error: 'Gagal memperbarui saldo. Silakan coba lagi.' }
              }

               const originalProvider = (() => {
                try {
                  const parsed = JSON.parse(bill.provider || '{}')
                  return parsed.original || null
                } catch {
                  return bill.provider || null
                }
              })()

              const { error: billError } = await supabase
                .from('bills')
                .update({
                  status: 'unpaid',
                  provider: originalProvider,
                })
                .eq('id', bill.id)
                .eq('workspace', workspace)

              if (billError) {
                console.error('unpayBill: Failed to update bill status:', billError.message)
                return { success: false, error: 'Gagal memperbarui status tagihan. Silakan coba lagi.' }
              }

              const txAmount = Math.abs(bill.amount)
              set((state) => ({
                transactions: state.transactions.filter((t) => t.id !== txId),
                balance: {
                  ...state.balance,
                  expenses: state.balance.expenses - txAmount,
                  availableBalance: state.balance.availableBalance + txAmount,
                },
                upcomingBills: state.upcomingBills.map((b) =>
                  b.id === bill.id
                    ? { ...b, status: 'unpaid', paidDate: undefined, paymentTransactionId: undefined }
                    : b
                ),
              }))

              await get().fetchAnalytics()

              return { success: true }
            } catch (err) {
              console.error('unpayBill: Unexpected error:', err)
              return { success: false, error: 'Gagal membatalkan pembayaran. Silakan coba lagi.' }
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
                console.warn('Failed to fetch accounts from Supabase, preserving current state:', error.message)
                set({ accounts: DASHBOARD_DATA.accounts[workspace] || [] })
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
             console.warn('Error fetching accounts from Supabase, preserving current state:', err)
              set({ accounts: DASHBOARD_DATA.accounts[workspace] || [] })
            }
         },

         fetchAnalytics: async () => {
           const workspace = get().currentWorkspace
           const mockAnalytics = DASHBOARD_DATA.analytics[workspace]

           if (!isSupabaseConfigured) {
             set({
               analytics: mockAnalytics,
               balance: {
                 ...get().balance,
                 ...DASHBOARD_DATA.balance[workspace],
               },
             })
             return
           }

           const calculateAnalytics = (availableBalance: number) => {
             const transactions = get().transactions
             const moneyPockets = get().moneyPockets

             const totalIncome = transactions
               .filter((t) => t.amount >= 0)
               .reduce((sum, t) => sum + t.amount, 0)

             const totalExpense = transactions
               .filter((t) => t.amount < 0)
               .reduce((sum, t) => sum + Math.abs(t.amount), 0)

             const remainingBudget = totalIncome - totalExpense

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

             return {
               analytics: {
                 availableBalance,
                 totalIncome,
                 totalExpense,
                 remainingBudget,
                 monthlyCashflow,
                 healthScore,
                 savingsRate,
                 categorySpending,
                 budgetProgress,
               } as AnalyticsData,
               balance: {
                 income: totalIncome,
                 expenses: totalExpense,
                 remaining: remainingBudget,
               }
             }
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
               console.warn('Failed to fetch balances from Supabase:', balanceError.message)
             }

             const availableBalance = balanceRow
               ? Number(balanceRow.available_balance)
               : get().balance.availableBalance

             const result = calculateAnalytics(availableBalance)

              set({
                analytics: result.analytics,
                balance: {
                  ...get().balance,
                  ...result.balance,
                  availableBalance,
                },
              })
            } catch (err) {
              console.warn('Error calculating analytics from Supabase, preserving current state:', err)
              const result = calculateAnalytics(get().balance.availableBalance)
              set({
                analytics: result.analytics,
                balance: {
                  ...get().balance,
                  ...result.balance,
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
                console.warn('Failed to fetch budgets from Supabase, preserving current state:', error.message)
                set({ budgets: DASHBOARD_DATA.budgets[workspace] || [] })
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
              console.warn('Error fetching budgets from Supabase, preserving current state:', err)
              set({ budgets: DASHBOARD_DATA.budgets[workspace] || [] })
            }
        },

        fetchDebts: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              debts: DASHBOARD_DATA.debts[workspace] || [],
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
               console.warn('Failed to fetch debts from Supabase, preserving current state:', error.message)
               set({ debts: DASHBOARD_DATA.debts[workspace] || [] })
               return
             }

            if (data) {
              const debts: Debt[] = data
                .filter((row: any) => {
                  const provider = parseJsonSafe(row.provider)
                  return provider.type === 'hutang'
                })
                .map((row: any) => {
                  const provider = parseJsonSafe(row.provider)
                  const remaining = provider.remainingAmount != null
                    ? Number(provider.remainingAmount)
                    : Number(row.amount)
                  const total = Number(row.amount)
                  const payments: DebtPayment[] = Array.isArray(provider.payments)
                    ? provider.payments
                    : []
                  const actualStatus: DebtStatus = computeDebtStatus(remaining, total)
                  return {
                    id: row.id,
                    creditorName: row.title,
                    amount: total,
                    remainingAmount: remaining,
                    status: actualStatus,
                    dueDate: row.due_date,
                    note: provider.note || undefined,
                    icon: row.icon,
                    payments,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                  }
                })
              set({ debts })
            }
           } catch (err) {
             console.warn('Error fetching debts from Supabase, preserving current state:', err)
             set({ debts: DASHBOARD_DATA.debts[workspace] || [] })
           }
        },

        fetchCredits: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              credits: DASHBOARD_DATA.credits[workspace] || [],
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
               console.warn('Failed to fetch credits from Supabase, preserving current state:', error.message)
               set({ credits: DASHBOARD_DATA.credits[workspace] || [] })
               return
             }

            if (data) {
              const credits: Credit[] = data
                .filter((row: any) => {
                  const provider = parseJsonSafe(row.provider)
                  return provider.type === 'piutang'
                })
                .map((row: any) => {
                  const provider = parseJsonSafe(row.provider)
                  const remaining = provider.remainingAmount != null
                    ? Number(provider.remainingAmount)
                    : Number(row.amount)
                  const total = Number(row.amount)
                  const receipts: CreditReceipt[] = Array.isArray(provider.receipts)
                    ? provider.receipts
                    : []
                  const actualStatus: CreditStatus = computeCreditStatus(remaining, total)
                  return {
                    id: row.id,
                    debtorName: row.title,
                    amount: total,
                    remainingAmount: remaining,
                    status: actualStatus,
                    dueDate: row.due_date,
                    note: provider.note || undefined,
                    icon: row.icon,
                    receipts,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                  }
                })
              set({ credits })
            }
          } catch (err) {
            console.warn('Error fetching credits from Supabase, preserving current state:', err)
             set({ credits: DASHBOARD_DATA.credits[workspace] || [] })
           }
         },

        addDebt: async (debt) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            const newDebt: Debt = {
              id: `temp-debt-${Date.now()}`,
              ...debt,
              payments: [],
            }
            set((state) => ({
              debts: [...state.debts, newDebt],
            }))
            return { success: true }
          }

          try {
            const provider = {
              type: 'hutang',
              creditorName: debt.creditorName,
              remainingAmount: debt.remainingAmount,
              actualStatus: debt.status,
              note: debt.note || null,
              payments: [],
            }

            const { error } = await supabase
              .from('bills')
              .insert({
                workspace,
                title: debt.creditorName,
                amount: debt.amount,
                currency: WORKSPACES.find((w) => w.id === workspace)?.currency.code || 'IDR',
                due_date: debt.dueDate || '2099-12-31',
                status: debt.status === 'paid' ? 'paid' : 'unpaid',
                icon: debt.icon || '🧾',
                provider: JSON.stringify(provider),
              })

            if (error) {
              console.error('Failed to add debt:', error)
              return { success: false, error: 'Gagal menambahkan hutang.' }
            }

            await get().fetchDebts()
            return { success: true }
          } catch (err) {
            console.error('Error adding debt:', err)
            return { success: false, error: 'Failed to add debt.' }
          }
        },

        editDebt: async (id, debt) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set((state) => ({
              debts: state.debts.map((d) =>
                d.id === id
                  ? { ...d, ...debt, status: debt.status ?? d.status, remainingAmount: debt.remainingAmount ?? d.remainingAmount }
                  : d
              ),
            }))
            return { success: true }
          }

          try {
            const { data: existingBill, error: fetchError } = await supabase
              .from('bills')
              .select('provider')
              .eq('id', id)
              .single()

            if (fetchError || !existingBill) {
              return { success: false, error: 'Debt record not found.' }
            }

            const provider = parseJsonSafe(existingBill.provider)
            const updatedProvider = {
              ...provider,
              creditorName: debt.creditorName ?? provider.creditorName,
              note: debt.note ?? provider.note,
              remainingAmount: debt.remainingAmount ?? provider.remainingAmount,
              actualStatus: debt.status ?? provider.actualStatus,
            }

            const { error } = await supabase
              .from('bills')
              .update({
                title: debt.creditorName ?? provider.creditorName,
                amount: debt.amount,
                due_date: debt.dueDate || '2099-12-31',
                icon: debt.icon,
                provider: JSON.stringify(updatedProvider),
              })
              .eq('id', id)
              .eq('workspace', workspace)

            if (error) {
              console.error('Failed to edit debt:', error)
              return { success: false, error: 'Gagal mengedit hutang.' }
            }

            await get().fetchDebts()
            return { success: true }
          } catch (err) {
            console.error('Error editing debt:', err)
            return { success: false, error: 'Failed to edit debt.' }
          }
        },

        deleteDebt: async (id) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set((state) => ({
              debts: state.debts.filter((d) => d.id !== id),
            }))
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('bills')
              .delete()
              .eq('id', id)
              .eq('workspace', workspace)

            if (error) {
              console.error('Failed to delete debt:', error)
              return { success: false, error: 'Failed to delete debt.' }
            }

            await get().fetchDebts()
            return { success: true }
          } catch (err) {
            console.error('Error deleting debt:', err)
            return { success: false, error: 'Failed to delete debt.' }
          }
        },

        payDebt: async (debt, amount, paymentDate, note) => {
          const workspace = get().currentWorkspace

          if (debt.status === 'paid') {
            return { success: false, error: 'Hutang sudah lunas.' }
          }

          if (amount <= 0) {
            return { success: false, error: 'Jumlah pembayaran harus lebih dari 0.' }
          }

          if (amount > debt.remainingAmount) {
            return { success: false, error: 'Jumlah pembayaran melebihi sisa hutang.' }
          }

          if (!isSupabaseConfigured) {
            const newRemaining = debt.remainingAmount - amount
            const newStatus: DebtStatus = computeDebtStatus(newRemaining, debt.amount)
            const newPayment: DebtPayment = {
              id: `temp-pay-${Date.now()}`,
              debtId: debt.id,
              amount,
              paymentDate,
              note,
              createdAt: new Date().toISOString(),
            }
            const updatedDebt: Debt = {
              ...debt,
              remainingAmount: newRemaining,
              status: newStatus,
              payments: [...debt.payments, newPayment],
            }
            const txAmount = -amount
            const newTx: Transaction = {
              id: `temp-tx-${Date.now()}`,
              description: `Bayar Hutang: ${debt.creditorName}${note ? ` - ${note}` : ''}`,
              category: 'Hutang',
              date: paymentDate,
              amount: txAmount,
              icon: '💳',
              createdAt: new Date().toISOString(),
            }
            set((state) => ({
              debts: state.debts.map((d) => (d.id === debt.id ? updatedDebt : d)),
              transactions: [...state.transactions, newTx],
              balance: {
                ...state.balance,
                expenses: state.balance.expenses + amount,
                availableBalance: state.balance.availableBalance - amount,
              },
            }))
            try {
              await get().fetchAnalytics()
            } catch {}
            return { success: true }
          }

          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('available_balance')
              .eq('workspace', workspace)
              .single()

            if (profileError || !profileData) {
              return { success: false, error: 'Gagal memuat saldo.' }
            }

            const availableBalance = Number(profileData.available_balance)
            if (amount > availableBalance) {
              return { success: false, error: 'Saldo tersedia tidak mencukupi.' }
            }

            const { error: txError } = await supabase
              .from('transactions')
              .insert({
                workspace,
                description: `Bayar Hutang: ${debt.creditorName}${note ? ` - ${note}` : ''}`,
                category: 'Hutang',
                date: paymentDate,
                amount: -amount,
                icon: '💳',
              })

            if (txError) {
              console.error('payDebt: Failed to create transaction:', txError)
              return { success: false, error: 'Gagal mencatat transaksi.' }
            }

            const newRemaining = debt.remainingAmount - amount
            const newStatus: DebtStatus = computeDebtStatus(newRemaining, debt.amount)
            const txAmount = -amount

            const updatedProvider = {
              type: 'hutang',
              creditorName: debt.creditorName,
              remainingAmount: newRemaining,
              actualStatus: newStatus,
              note: debt.note || null,
              payments: [
                ...debt.payments,
                {
                  id: `pay-${Date.now()}`,
                  debtId: debt.id,
                  amount,
                  paymentDate,
                  note,
                  createdAt: new Date().toISOString(),
                },
              ],
            }

            const { error: billError } = await supabase
              .from('bills')
              .update({
                amount: debt.amount,
                provider: JSON.stringify(updatedProvider),
              })
              .eq('id', debt.id)
              .eq('workspace', workspace)

            if (billError) {
              console.error('payDebt: Failed to update debt:', billError.message)
              return { success: false, error: 'Gagal memperbarui hutang.' }
            }

            const { error: balanceError } = await supabase
              .from('profiles')
              .update({
                available_balance: availableBalance - amount,
                expenses: Number((await supabase
                  .from('profiles')
                  .select('expenses')
                  .eq('workspace', workspace)
                  .single()).data?.expenses || 0) + amount,
              })
              .eq('workspace', workspace)

            if (balanceError) {
              console.error('payDebt: Failed to update balance:', balanceError.message)
              return { success: false, error: 'Gagal memperbarui saldo.' }
            }

            const newPayment: DebtPayment = {
              id: `pay-${Date.now()}`,
              debtId: debt.id,
              amount,
              paymentDate,
              note,
              createdAt: new Date().toISOString(),
            }

            set((state) => ({
              debts: state.debts.map((d) =>
                d.id === debt.id
                  ? {
                      ...d,
                      remainingAmount: newRemaining,
                      status: newStatus,
                      payments: [...d.payments, newPayment],
                    }
                  : d
              ),
              transactions: [
                ...state.transactions,
                {
                  id: `tx-${Date.now()}`,
                  description: `Bayar Hutang: ${debt.creditorName}${note ? ` - ${note}` : ''}`,
                  category: 'Hutang',
                  date: paymentDate,
                  amount: txAmount,
                  icon: '💳',
                  createdAt: new Date().toISOString(),
                },
              ],
              balance: {
                ...state.balance,
                expenses: state.balance.expenses + amount,
                availableBalance: state.balance.availableBalance - amount,
              },
            }))

            await get().fetchAnalytics()

            return { success: true }
          } catch (err) {
            console.error('payDebt: Unexpected error:', err)
            return { success: false, error: 'Gagal membayar hutang.' }
          }
        },

        addCredit: async (credit) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            const newCredit: Credit = {
              id: `temp-credit-${Date.now()}`,
              ...credit,
              receipts: [],
            }
            set((state) => ({
              credits: [...state.credits, newCredit],
            }))
            return { success: true }
          }

          try {
            const provider = {
              type: 'piutang',
              debtorName: credit.debtorName,
              remainingAmount: credit.remainingAmount,
              actualStatus: credit.status,
              note: credit.note || null,
              receipts: [],
            }

            const { error } = await supabase
              .from('bills')
              .insert({
                workspace,
                title: credit.debtorName,
                amount: credit.amount,
                currency: WORKSPACES.find((w) => w.id === workspace)?.currency.code || 'IDR',
                due_date: credit.dueDate || '2099-12-31',
                status: credit.status === 'received' ? 'paid' : 'unpaid',
                icon: credit.icon || '💰',
                provider: JSON.stringify(provider),
              })

            if (error) {
              console.error('Failed to add credit:', error)
              return { success: false, error: 'Gagal menambahkan piutang.' }
            }

            await get().fetchCredits()
            return { success: true }
          } catch (err) {
            console.error('Error adding credit:', err)
            return { success: false, error: 'Failed to add credit.' }
          }
        },

        editCredit: async (id, credit) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set((state) => ({
              credits: state.credits.map((c) =>
                c.id === id
                  ? { ...c, ...credit, status: credit.status ?? c.status, remainingAmount: credit.remainingAmount ?? c.remainingAmount }
                  : c
              ),
            }))
            return { success: true }
          }

          try {
            const { data: existingBill, error: fetchError } = await supabase
              .from('bills')
              .select('provider')
              .eq('id', id)
              .single()

            if (fetchError || !existingBill) {
              return { success: false, error: 'Credit record not found.' }
            }

            const provider = parseJsonSafe(existingBill.provider)
            const updatedProvider = {
              ...provider,
              debtorName: credit.debtorName ?? provider.debtorName,
              note: credit.note ?? provider.note,
              remainingAmount: credit.remainingAmount ?? provider.remainingAmount,
              actualStatus: credit.status ?? provider.actualStatus,
            }

            const { error } = await supabase
              .from('bills')
              .update({
                title: credit.debtorName ?? provider.debtorName,
                amount: credit.amount,
                due_date: credit.dueDate || '2099-12-31',
                icon: credit.icon,
                provider: JSON.stringify(updatedProvider),
              })
              .eq('id', id)
              .eq('workspace', workspace)

            if (error) {
              console.error('Failed to edit credit:', error)
              return { success: false, error: 'Gagal mengedit piutang.' }
            }

            await get().fetchCredits()
            return { success: true }
          } catch (err) {
            console.error('Error editing credit:', err)
            return { success: false, error: 'Failed to edit credit.' }
          }
        },

        deleteCredit: async (id) => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set((state) => ({
              credits: state.credits.filter((c) => c.id !== id),
            }))
            return { success: true }
          }

          try {
            const { error } = await supabase
              .from('bills')
              .delete()
              .eq('id', id)
              .eq('workspace', workspace)

            if (error) {
              console.error('Failed to delete credit:', error)
              return { success: false, error: 'Failed to delete credit.' }
            }

            await get().fetchCredits()
            return { success: true }
          } catch (err) {
            console.error('Error deleting credit:', err)
            return { success: false, error: 'Failed to delete credit.' }
          }
        },

        receiveCredit: async (credit, amount, receiptDate, note) => {
          const workspace = get().currentWorkspace

          if (credit.status === 'received') {
            return { success: false, error: 'Piutang sudah diterima.' }
          }

          if (amount <= 0) {
            return { success: false, error: 'Jumlah penerimaan harus lebih dari 0.' }
          }

          if (amount > credit.remainingAmount) {
            return { success: false, error: 'Jumlah penerimaan melebihi sisa piutang.' }
          }

          if (!isSupabaseConfigured) {
            const newRemaining = credit.remainingAmount - amount
            const newStatus: CreditStatus = computeCreditStatus(newRemaining, credit.amount)
            const newReceipt: CreditReceipt = {
              id: `temp-recv-${Date.now()}`,
              creditId: credit.id,
              amount,
              receiptDate,
              note,
              createdAt: new Date().toISOString(),
            }
            const updatedCredit: Credit = {
              ...credit,
              remainingAmount: newRemaining,
              status: newStatus,
              receipts: [...credit.receipts, newReceipt],
            }
            const txAmount = amount
            const newTx: Transaction = {
              id: `temp-tx-${Date.now()}`,
              description: `Terima Piutang: ${credit.debtorName}${note ? ` - ${note}` : ''}`,
              category: 'Piutang',
              date: receiptDate,
              amount: txAmount,
              icon: '💵',
              createdAt: new Date().toISOString(),
            }
            set((state) => ({
              credits: state.credits.map((c) => (c.id === credit.id ? updatedCredit : c)),
              transactions: [...state.transactions, newTx],
              balance: {
                ...state.balance,
                income: state.balance.income + amount,
                availableBalance: state.balance.availableBalance + amount,
              },
            }))
            try {
              await get().fetchAnalytics()
            } catch {}
            return { success: true }
          }

          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('available_balance')
              .eq('workspace', workspace)
              .single()

            if (profileError || !profileData) {
              return { success: false, error: 'Gagal memuat saldo.' }
            }

            const availableBalance = Number(profileData.available_balance)

            const { error: txError } = await supabase
              .from('transactions')
              .insert({
                workspace,
                description: `Terima Piutang: ${credit.debtorName}${note ? ` - ${note}` : ''}`,
                category: 'Piutang',
                date: receiptDate,
                amount: amount,
                icon: '💵',
              })

            if (txError) {
              console.error('receiveCredit: Failed to create transaction:', txError)
              return { success: false, error: 'Gagal mencatat transaksi.' }
            }

            const newRemaining = credit.remainingAmount - amount
            const newStatus: CreditStatus = computeCreditStatus(newRemaining, credit.amount)
            const txAmount = amount

            const updatedProvider = {
              type: 'piutang',
              debtorName: credit.debtorName,
              remainingAmount: newRemaining,
              actualStatus: newStatus,
              note: credit.note || null,
              receipts: [
                ...credit.receipts,
                {
                  id: `recv-${Date.now()}`,
                  creditId: credit.id,
                  amount,
                  receiptDate,
                  note,
                  createdAt: new Date().toISOString(),
                },
              ],
            }

            const { error: billError } = await supabase
              .from('bills')
              .update({
                amount: credit.amount,
                provider: JSON.stringify(updatedProvider),
              })
              .eq('id', credit.id)
              .eq('workspace', workspace)

            if (billError) {
              console.error('receiveCredit: Failed to update credit:', billError.message)
              return { success: false, error: 'Gagal memperbarui piutang.' }
            }

            const { error: balanceError } = await supabase
              .from('profiles')
              .update({
                available_balance: availableBalance + amount,
              })
              .eq('workspace', workspace)

            if (balanceError) {
              console.error('receiveCredit: Failed to update balance:', balanceError.message)
              return { success: false, error: 'Gagal memperbarui saldo.' }
            }

            const newReceipt: CreditReceipt = {
              id: `recv-${Date.now()}`,
              creditId: credit.id,
              amount,
              receiptDate,
              note,
              createdAt: new Date().toISOString(),
            }

            set((state) => ({
              credits: state.credits.map((c) =>
                c.id === credit.id
                  ? {
                      ...c,
                      remainingAmount: newRemaining,
                      status: newStatus,
                      receipts: [...c.receipts, newReceipt],
                    }
                  : c
              ),
              transactions: [
                ...state.transactions,
                {
                  id: `tx-${Date.now()}`,
                  description: `Terima Piutang: ${credit.debtorName}${note ? ` - ${note}` : ''}`,
                  category: 'Piutang',
                  date: receiptDate,
                  amount: txAmount,
                  icon: '💵',
                  createdAt: new Date().toISOString(),
                },
              ],
              balance: {
                ...state.balance,
                income: state.balance.income + amount,
                availableBalance: state.balance.availableBalance + amount,
              },
            }))

            await get().fetchAnalytics()

            return { success: true }
          } catch (err) {
            console.error('receiveCredit: Unexpected error:', err)
            return { success: false, error: 'Gagal menerima piutang.' }
          }
        },

        clearAllDebtsAndCredits: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({ debts: [], credits: [] })
            return { success: true }
          }

          try {
            const { data: debtBills, error: debtErr } = await supabase
              .from('bills')
              .select('id')
              .eq('workspace', workspace)

            if (debtErr) {
              console.error('clearAllDebtsAndCredits: Failed to fetch bills:', debtErr.message)
              return { success: false, error: debtErr.message }
            }

            const idsToDelete: string[] = []
            if (debtBills) {
              debtBills.forEach((row: any) => {
                const provider = parseJsonSafe(row.provider)
                if (provider.type === 'hutang' || provider.type === 'piutang') {
                  idsToDelete.push(row.id)
                }
              })
            }

            if (idsToDelete.length > 0) {
              const { error: delErr } = await supabase
                .from('bills')
                .delete()
                .in('id', idsToDelete)
                .eq('workspace', workspace)

              if (delErr) {
                console.error('clearAllDebtsAndCredits: Failed to delete:', delErr.message)
                return { success: false, error: delErr.message }
              }
            }

            set({ debts: [], credits: [] })
            return { success: true }
          } catch (err) {
             console.error('clearAllDebtsAndCredits: Unexpected error:', err)
             return { success: false, error: 'Gagal membersihkan data.' }
           }
         },

        clearAllData: async () => {
          const workspace = get().currentWorkspace

          if (!isSupabaseConfigured) {
            set({
              transactions: [],
              upcomingBills: [],
              moneyPockets: [],
              debts: [],
              credits: [],
              balance: {
                totalBalance: 0,
                income: 0,
                expenses: 0,
                remaining: 0,
                safeSpending: 0,
                availableBalance: 0,
              },
              analytics: {
                availableBalance: 0,
                totalIncome: 0,
                totalExpense: 0,
                remainingBudget: 0,
                monthlyCashflow: 0,
                healthScore: 0,
                savingsRate: 0,
                categorySpending: [],
                budgetProgress: [0, 0, 0, 0],
              },
              accounts: [],
              budgets: [],
            })
            return { success: true }
          }

          try {
            const { data: allBills, error: fetchErr } = await supabase
              .from('bills')
              .select('id, workspace, provider')
              .eq('workspace', workspace)

            if (fetchErr) {
              console.error('clearAllData: Failed to fetch bills:', fetchErr.message)
              return { success: false, error: fetchErr.message }
            }

            const idsToDelete: string[] = []
            if (allBills) {
              allBills.forEach((row: any) => {
                const provider = parseJsonSafe(row.provider)
                if (
                  provider.type === 'hutang' ||
                  provider.type === 'piutang' ||
                  !row.provider ||
                  row.provider === ''
                ) {
                  idsToDelete.push(row.id)
                }
              })
            }

            if (idsToDelete.length > 0) {
              const { error: delErr } = await supabase
                .from('bills')
                .delete()
                .in('id', idsToDelete)

              if (delErr) {
                console.error('clearAllData: Failed to delete bills:', delErr.message)
                return { success: false, error: delErr.message }
              }
            }

            set({
              transactions: [],
              upcomingBills: [],
              moneyPockets: [],
              debts: [],
              credits: [],
              balance: {
                totalBalance: 0,
                income: 0,
                expenses: 0,
                remaining: 0,
                safeSpending: 0,
                availableBalance: 0,
              },
              analytics: {
                availableBalance: 0,
                totalIncome: 0,
                totalExpense: 0,
                remainingBudget: 0,
                monthlyCashflow: 0,
                healthScore: 0,
                savingsRate: 0,
                categorySpending: [],
                budgetProgress: [0, 0, 0, 0],
              },
              accounts: [],
              budgets: [],
            })

            return { success: true }
          } catch (err) {
            console.error('clearAllData: Unexpected error:', err)
            return { success: false, error: 'Gagal membersihkan data.' }
          }
        },
      }},
      { name: 'finance-os-storage', version: 3, migrate: () => undefined }
    )
  )
)
