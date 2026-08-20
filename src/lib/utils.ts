import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'LKR' | 'IDR' | 'USD'): string {
  let symbol: string
  let locale: string
  if (currency === 'LKR') { symbol = 'Rs'; locale = 'en-LK' }
  else if (currency === 'IDR') { symbol = 'Rp'; locale = 'id-ID' }
  else { symbol = '$'; locale = 'en-US' }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount)).replace(currency, symbol)
}

export function formatCurrencyFull(amount: number, currency: 'LKR' | 'IDR' | 'USD'): string {
  let symbol: string
  let abs: number
  let formatted: string
  if (currency === 'LKR') { symbol = 'Rs'; abs = Math.abs(amount); formatted = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(abs) }
  else if (currency === 'IDR') { symbol = 'Rp'; abs = Math.abs(amount); formatted = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(abs) }
  else { symbol = '$'; abs = Math.abs(amount); formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(abs) }
  return `${symbol}${formatted}`
}

export function formatRupiah(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(abs)
  return `Rp${formatted}`
}

export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1000000000) return `Rp ${(abs / 1000000000).toFixed(1)}M`
  if (abs >= 1000000) return `Rp ${(abs / 1000000).toFixed(1)}Jt`
  if (abs >= 1000) return `Rp ${(abs / 1000).toFixed(0)}Rb`
  return formatRupiah(abs)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount)
}

export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  const first = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const second = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.round((second - first) / oneDay)
}

export function getDueDateLabel(dueDate: string): string {
  const today = new Date()
  const due = new Date(dueDate)
  const diff = daysBetween(today, due)

  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7) return `${diff} Days`
  if (diff < 14) return `${diff} Days`
  if (diff < 30) {
    const weeks = Math.floor(diff / 7)
    return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`
  }
  const months = Math.floor(diff / 30)
  return `${months} ${months === 1 ? 'Month' : 'Months'}`
}

export function getDueDateColor(dueDate: string): string {
  const today = new Date()
  const due = new Date(dueDate)
  const diff = daysBetween(today, due)

  if (diff < 0) return 'text-red-500'
  if (diff === 0) return 'text-rose-500'
  if (diff <= 3) return 'text-amber-500'
  if (diff <= 7) return 'text-amber-400'
  return 'text-text-tertiary'
}

export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-sri-500'
  if (progress >= 75) return 'bg-sri-400'
  if (progress >= 50) return 'bg-amber-400'
  if (progress >= 25) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getProgressColorIndo(progress: number): string {
  if (progress >= 100) return 'bg-indo-500'
  if (progress >= 75) return 'bg-indo-400'
  if (progress >= 50) return 'bg-amber-400'
  if (progress >= 25) return 'bg-amber-500'
  return 'bg-red-500'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const categoryIcons: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎮',
  'Bills & Utilities': '💡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Salary': '💰',
  'Investment': '📈',
  'Transfer': '🏦',
  'Subscription': '🔄',
  'Coffee': '☕',
  'Groceries': '🛒',
}

export function getCategoryIcon(category: string): string {
  return categoryIcons[category] || '💳'
}
