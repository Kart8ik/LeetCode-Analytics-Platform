import { useEffect, useState } from 'react'
import { Sun, Moon} from 'lucide-react'
import LogoLight from '@/assets/images/icons/logo-icon-whitebg1.png'
import LogoDark from '@/assets/images/icons/logo-icon-blackbg.png'


export default function TopNavbar() {
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = stored ? stored === 'dark' : prefersDark
      setIsDark(initial)
      if (initial) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch {
      // ignore storage/read errors
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // ignore localStorage write errors (private mode, etc.)
    }
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={isDark ? LogoLight : LogoDark} 
            alt="LeetTrack Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LeetTrack</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Track your coding journey with your friends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            className={`relative inline-flex h-8 w-16 items-center justify-between px-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              isDark ? 'bg-slate-700' : 'bg-slate-300'
            }`}
          >
            <Sun className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-yellow-500'} z-10`} aria-hidden="true" />
            <span
              className={`absolute inline-block h-6 w-6 left-1 transform rounded-full bg-white shadow transition-transform ${
                isDark ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
            <Moon className={`h-4 w-4 ${isDark ? 'text-slate-200' : 'text-slate-500'} z-10`} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}