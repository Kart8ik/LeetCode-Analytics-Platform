import { useAuth } from "@/context/AuthContext"
import { Moon, Sun } from "lucide-react"


const ThemeToggle = () => {
    const { isDark, toggleTheme } = useAuth()
  return (
      <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={toggleTheme}
          onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleTheme()
              }
          }}
          className={`relative inline-flex h-8 w-16 items-center justify-between px-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isDark ? 'bg-slate-700' : 'bg-slate-300'
              }`}
      >
          <Sun className={`h-4 w-4 ml-0.5 ${isDark ? 'text-slate-500' : 'text-yellow-500'} z-10`} aria-hidden="true" />
          <span
              className={`absolute inline-block h-6 w-6 left-1 transform rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-8' : 'translate-x-0'
                  }`}
          />
          <Moon className={`h-4 w-4 mr-0.5 text-slate-500 z-10`} aria-hidden="true" />
      </button>
  )
}

export default ThemeToggle
