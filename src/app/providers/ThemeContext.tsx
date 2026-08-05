import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'finance-os-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (saved === 'light' || saved === 'dark') {
        return saved
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'light'
  }

  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light')),
      setTheme: setThemeState,
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
