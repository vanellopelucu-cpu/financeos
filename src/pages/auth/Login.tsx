import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthContext'
import { cn } from '../../lib/utils'

export function Login() {
  const navigate = useNavigate()
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">💎</div>
          <p className="text-text-secondary">Loading FinanceOS...</p>
        </div>
      </div>
    )
  }

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')

    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/', { replace: true })
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
            Sign in to your account
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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(
                'w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
              )}
              placeholder="••••••••"
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

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
            )}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-workspace hover:text-workspace-hover"
          >
            Forgot password?
          </Link>
          <Link
            to="/signup"
            className="text-sm text-workspace hover:text-workspace-hover"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
