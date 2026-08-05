export function formatCurrency(amount: number, currency: 'LKR' | 'IDR'): string {
  const symbol = currency === 'LKR' ? 'Rs' : 'Rp'
  const locale = currency === 'LKR' ? 'en-LK' : 'id-ID'
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
  return `${symbol}${formatted}`
}
