import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

interface UserMetadata {
  display_name?: string
  avatar_url?: string
  created_at?: string
}

interface AuthContextValue {
  user: {
    id: string
    email?: string | null
    user_metadata?: UserMetadata
  } | null
  session: { access_token: string; user: { id: string; email?: string | null } } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updateUser: (data: { data?: UserMetadata; password?: string }) => Promise<{ error?: string }>
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [session, setSession] = useState<AuthContextValue['session']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      }
      setSession(session as any)
      setUser(session?.user as any)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session as any)
        setUser(session?.user as any)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return { error: error.message }
    return {}
  }

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) return { error: error.message }
    return {}
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return { error: error.message }
    return {}
  }

  const updateUser = async (data: { data?: UserMetadata; password?: string }) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' }
    const updateObj: { data?: UserMetadata; password?: string } = {}
    if (data.data) updateObj.data = data.data
    if (data.password) updateObj.password = data.password
    const { error } = await supabase.auth.updateUser(updateObj)
    if (error) return { error: error.message }
    return {}
  }

  const uploadAvatar = async (file: File) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' }
    const fileExt = file.name.split('.').pop()
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`

    const serviceKey = typeof __SUPABASE_SERVICE_KEY__ !== 'undefined' ? String(__SUPABASE_SERVICE_KEY__) : ''
    if (!serviceKey) {
      return { error: 'Storage service key not configured. Missing SUPABASE_SERVICE_KEY in environment.' }
    }

    const storageClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: uploadError } = await storageClient.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = storageClient.storage.from('avatars').getPublicUrl(fileName)
    return { url: urlData.publicUrl }
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateUser,
      uploadAvatar,
    }),
    [user, session, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])
}
