export interface ParsedTransaction {
  workspace: 'indonesia' | 'srilanka'
  currency: 'IDR' | 'LKR'
  type: 'income' | 'expense'
  amount: number
  description: string
}

const CURRENCY_PATTERNS = [
  { token: '+idr', workspace: 'indonesia' as const, currency: 'IDR' as const, type: 'income' as const },
  { token: '-idr', workspace: 'indonesia' as const, currency: 'IDR' as const, type: 'expense' as const },
  { token: '+lkr', workspace: 'srilanka' as const, currency: 'LKR' as const, type: 'income' as const },
  { token: '-lkr', workspace: 'srilanka' as const, currency: 'LKR' as const, type: 'expense' as const },
]

export function parseTransaction(message: string): ParsedTransaction | null {
  const trimmed = message.trim()

  for (const pattern of CURRENCY_PATTERNS) {
    const regex = new RegExp(`\\${pattern.token}(\\d+)`, 'i')
    const match = trimmed.match(regex)
    if (match) {
      const rawAmount = parseInt(match[1], 10)
      const amount = pattern.type === 'expense' ? -rawAmount : rawAmount

      const withoutCurrency = trimmed.replace(new RegExp(`[+-]${pattern.currency === 'IDR' ? 'idr' : 'lkr'}\\d+`, 'i'), '').trim()
      const description = withoutCurrency.replace(/\s+/g, ' ').trim()

      return {
        workspace: pattern.workspace,
        currency: pattern.currency,
        type: pattern.type,
        amount,
        description,
      }
    }
  }

  return null
}