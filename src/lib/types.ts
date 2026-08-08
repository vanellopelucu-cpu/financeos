export type Theme = 'light' | 'dark'

export type WorkspaceId = 'srilanka' | 'indonesia'

export type WorkspaceTheme = 'green' | 'blue'

export interface Currency {
  code: 'LKR' | 'IDR'
  symbol: string
  name: string
}

export interface Workspace {
  id: WorkspaceId
  name: string
  country: string
  currency: Currency
  theme: WorkspaceTheme
  warningThreshold: number
  warningMessage: string
  shortCode: string
}

export interface Transaction {
  id: string
  description: string
  category: string
  date: string
  amount: number
  icon?: string
  createdAt?: string
}

export interface Bill {
  id: string
  title: string
  amount: number
  dueDate: string
  icon?: string
  provider?: string
}

export interface MoneyPocket {
  id: string
  name: string
  icon: string
  currentAmount: number
  targetAmount: number
  status: 'on-track' | 'behind' | 'completed' | 'just-started'
}

export interface Account {
  id: string
  name: string
  type: string
  icon: string
  accountNumber: string
  balance: number
  status: 'active' | 'primary'
  lastUpdated: string
}

export interface CategorySpending {
  category: string
  amount: number
  percentage: number
  icon: string
}

export interface BudgetCategory {
  id: string
  name: string
  icon: string
  allocated: number
  spent: number
}

export interface AnalyticsData {
  availableBalance: number
  totalIncome: number
  totalExpense: number
  remainingBudget: number
  monthlyCashflow: number
  healthScore: number
  savingsRate: number
  categorySpending: CategorySpending[]
  budgetProgress: number[]
}

export interface BalanceInfo {
  totalBalance: number
  income: number
  expenses: number
  remaining: number
  safeSpending: number
  availableBalance: number
}

export interface DashboardData {
  balance: Record<string, BalanceInfo>
  upcomingBills: Record<string, Bill[]>
  moneyPockets: Record<string, MoneyPocket[]>
  transactions: Record<string, Transaction[]>
  workspaces: Workspace[]
  accounts: Record<string, Account[]>
  analytics: Record<string, AnalyticsData>
  budgets: Record<string, BudgetCategory[]>
}
