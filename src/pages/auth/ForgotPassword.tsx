import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthContext'
import { cn } from '../../lib/utils'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')
    setMessage('')

    const result = await resetPassword(email)
    if (result.error) {
      setError(result.error)
    } else {
      setMessage('Password reset link sent to your email. Check your inbox.')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-surface dark:to-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl mx-auto">
            <span className="text-2xl font-bold">💎</span>
          </div>
          <h1 className="text-3xl font-bold text-text">FinanceOS</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                'w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
              )}
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-sri-500"
            >
              {message}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
            )}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </motion.button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <Link
            to="/login"
            className="text-sm text-workspace hover:text-workspace-hover"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
