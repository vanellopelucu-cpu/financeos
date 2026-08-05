import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  elevated?: boolean
  interactive?: boolean
  workspaceAccent?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, glass = false, elevated = false, interactive = false, workspaceAccent = false, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-[20px] border bg-surface transition-all duration-300',
        glass
          ? 'glass'
          : 'border-border bg-surface shadow-soft dark:shadow-soft-dark',
        elevated && !glass && 'shadow-elevated dark:shadow-elevated-dark',
        interactive &&
          'hover:translate-y-[-2px] hover:shadow-xl dark:hover:shadow-2xl',
        workspaceAccent &&
          'border-workspace/30 dark:border-workspace/20',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6 pb-4',
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-text',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-4', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'
