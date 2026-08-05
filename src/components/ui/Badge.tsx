import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'workspace'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors'

    const variantClasses = {
      default: 'bg-surface text-text border border-border',
      secondary: 'bg-secondary text-text-secondary',
      outline:
        'border border-border text-text-secondary bg-transparent',
      success:
        'bg-success-100/50 text-success-800 dark:bg-success-900/30 dark:text-success-300',
      warning:
        'bg-warning-100/50 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
      destructive:
        'bg-error-100/50 text-error-800 dark:bg-error-900/30 dark:text-error-300',
      workspace:
        'bg-workspace/10 text-workspace border border-workspace/30',
    }

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs rounded-full',
      md: 'px-2.5 py-1 text-xs rounded-full',
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export interface HealthBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  health: 'excellent' | 'good' | 'fair' | 'needs-attention'
  workspace?: boolean
}

export const HealthBadge = forwardRef<HTMLSpanElement, HealthBadgeProps>(
  ({ className, health, workspace = false, ...props }, ref) => {
    const healthConfig = {
      excellent: {
        label: 'Excellent',
        classes: workspace
          ? 'bg-success-500/10 text-success-400 border-success-500/30'
          : 'bg-primary-500/10 text-primary-400 border-primary-500/30',
      },
      good: {
        label: 'Good',
        classes: workspace
          ? 'bg-success-500/10 text-success-400 border-success-500/30'
          : 'bg-secondary-400/10 text-secondary-400 border-secondary-400/30',
      },
      fair: {
        label: 'Fair',
        classes: workspace
          ? 'bg-warning-500/10 text-warning-400 border-warning-500/30'
          : 'bg-warning-500/10 text-warning-400 border-warning-500/30',
      },
      'needs-attention': {
        label: 'Needs Attention',
        classes: workspace
          ? 'bg-warning-500/10 text-warning-400 border-warning-500/30'
          : 'bg-warning-500/10 text-warning-400 border-warning-500/30',
      },
    }

    const config = healthConfig[health]

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
          config.classes,
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            'bg-current'
          )}
        />
        {config.label}
      </span>
    )
  }
)
HealthBadge.displayName = 'HealthBadge'
