import { cn } from '../../../lib/utils'

export function DashboardFooter() {
  const version = __APP_VERSION__ as string

  return (
    <footer
      className={cn(
        'mt-8 border-t border-border/50 py-3 text-center text-xs text-text-tertiary'
      )}
    >
      FinanceOS v{version}
    </footer>
  )
}
