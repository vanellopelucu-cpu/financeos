import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'workspace'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  workspaceTheme?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      workspaceTheme = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-primary-400 to-secondary-400 text-white hover:from-primary-500 hover:to-secondary-500 shadow-md hover:shadow-lg',
      secondary:
        'bg-secondary text-text hover:bg-secondary/80 border border-border',
      ghost:
        'text-text-secondary hover:bg-primary-200/30 hover:text-primary-700 dark:hover:bg-secondary/50 dark:hover:text-text',
      outline:
        'border border-border text-text hover:bg-primary-200/30 dark:hover:bg-secondary/50',
      workspace: workspaceTheme
        ? 'bg-gradient-to-r from-workspace to-workspace-hover text-white shadow-md hover:shadow-lg'
        : 'bg-gradient-to-r from-primary-400 to-secondary-400 text-white hover:from-primary-500 hover:to-secondary-500',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[workspaceTheme ? 'workspace' : variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'
