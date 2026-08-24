import type {
  Account,
  AnalyticsData,
  BalanceInfo,
  Bill,
  BudgetCategory,
  Credit,
  CreditReceipt,
  DashboardData,
  Debt,
  DebtPayment,
  MoneyPocket,
  Transaction,
  Workspace,
} from '../lib/types'

export const WORKSPACES: Workspace[] = [
  {
    id: 'srilanka',
    name: 'Sri Lanka',
    country: 'Sri Lanka',
    currency: { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    theme: 'green',
    warningThreshold: 20000,
    warningMessage:
      'Your available balance is below the recommended minimum balance. Consider reducing unnecessary expenses or adding funds to stay financially comfortable.',
    shortCode: 'LK',
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    country: 'Indonesia',
    currency: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    theme: 'blue',
    warningThreshold: 5000000,
    warningMessage:
      'Your available balance is below the recommended minimum balance. Consider reducing unnecessary expenses or adding funds to stay financially comfortable.',
    shortCode: 'ID',
  },
]

export const BALANCE_INFO: Record<string, BalanceInfo> = {
  'srilanka': {
    totalBalance: 0,
    income: 0,
    expenses: 0,
    remaining: 0,
    safeSpending: 0,
    availableBalance: 0,
  },
  'indonesia': {
    totalBalance: 0,
    income: 0,
    expenses: 0,
    remaining: 0,
    safeSpending: 0,
    availableBalance: 0,
  },
}

export const UPCOMING_BILLS: Record<string, Bill[]> = {
  'srilanka': [],
  'indonesia': [],
}

export const MONEY_POCKETS: Record<string, MoneyPocket[]> = {
  'srilanka': [],
  'indonesia': [],
}

export const TRANSACTIONS: Record<string, Transaction[]> = {
  'srilanka': [],
  'indonesia': [],
}

export const ANALYTICS_DATA: Record<string, AnalyticsData> = {
  'srilanka': {
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
  'indonesia': {
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
}

export const MONTHLY_ANALYTICS_DATA: Record<
  string,
  { month: string; income: number; expenses: number; savings: number }[]
> = {
  'srilanka': [],
  'indonesia': [],
}

const ACCOUNTS_MOCK: Record<string, Account[]> = {
  'srilanka': [
    {
      id: 'acc-srl-ntb',
      name: 'NTB',
      type: 'bank',
      icon: '🏦',
      accountNumber: '',
      balance: 0,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'acc-srl-cash',
      name: 'Cash',
      type: 'cash',
      icon: '💵',
      accountNumber: '',
      balance: 0,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
  ],
  'indonesia': [
    {
      id: 'acc-idr-bca',
      name: 'BCA',
      type: 'bank',
      icon: '🏦',
      accountNumber: '',
      balance: 0,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'acc-idr-blue-bca',
      name: 'Blue BCA',
      type: 'bank',
      icon: '💎',
      accountNumber: '',
      balance: 0,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'acc-idr-cash',
      name: 'Cash',
      type: 'cash',
      icon: '💵',
      accountNumber: '',
      balance: 0,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'acc-idr-gopay',
      name: 'GoPay',
      type: 'ewallet',
      icon: '🟢',
      accountNumber: '',
      balance: 0,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
  ],
}

export { ACCOUNTS_MOCK }

export const BUDGET_CATEGORIES: Record<string, BudgetCategory[]> = {
  'srilanka': [],
  'indonesia': [],
}

export const DEBTS_DATA: Record<string, Debt[]> = {
  'indonesia': [],
  'srilanka': [],
}

export const CREDITS_DATA: Record<string, Credit[]> = {
  'indonesia': [],
  'srilanka': [],
}

export const DEBT_PAYMENTS_DATA: Record<string, DebtPayment[]> = {
  'indonesia': [],
  'srilanka': [],
}

export const CREDIT_RECEIPTS_DATA: Record<string, CreditReceipt[]> = {
  'indonesia': [],
  'srilanka': [],
}

export const DASHBOARD_DATA: DashboardData = {
  balance: BALANCE_INFO,
  upcomingBills: UPCOMING_BILLS,
  moneyPockets: MONEY_POCKETS,
  transactions: TRANSACTIONS,
  workspaces: WORKSPACES,
  accounts: ACCOUNTS_MOCK,
  analytics: ANALYTICS_DATA,
  budgets: BUDGET_CATEGORIES,
  debts: DEBTS_DATA,
  credits: CREDITS_DATA,
  debtPayments: DEBT_PAYMENTS_DATA,
  creditReceipts: CREDIT_RECEIPTS_DATA,
}
