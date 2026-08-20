import { cn } from '../../../lib/utils'

const ICONS = [
  '💰', '🏠', '🎓', '🚨', '🏖️', '🏠', '🐷', '✈️', '🛍️',
  '🍽️', '🚗', '💡', '📚', '☕', '📱', '🎮', '📈', '🏦',
  '🔔', '⭐', '🌟', '💎', '🎯', '🎁', '🎪', '🎨', '🎵',
  '📷', '📺', '🎧', '🎮', '📱', '💳', '🏥', '⚽', '📖',
]

interface PocketIconSelectorProps {
  icon: string
  onChange: (icon: string) => void
}

export function PocketIconSelector({ icon, onChange }: PocketIconSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary">Icon</label>
      <div className="mt-2 grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-2">
        {ICONS.map((ic) => (
          <button
            key={ic}
            type="button"
            onClick={() => onChange(ic)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all sm:h-10 sm:w-10',
              icon === ic
                ? 'ring-2 ring-workspace bg-workspace/10'
                : 'hover:bg-secondary'
            )}
          >
            {ic}
          </button>
        ))}
      </div>
    </div>
  )
}

