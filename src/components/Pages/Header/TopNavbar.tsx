import { useEffect, useState } from 'react'
import { Button } from '@/components/Pages/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/Pages/ui/hover-card'
import { Sun, Moon, Zap } from 'lucide-react'

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
    } catch {}
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  return (
    <div className="w-full p-4 md:p-6 bg-background">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LeetTrack</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your coding journey</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Sun className="h-4 w-4 text-yellow-500" aria-hidden="true" />
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle theme"
            onClick={toggleTheme}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleTheme()
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
          <Moon className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button size="sm" className="md:size-default">
                <Zap className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 border-white dark:border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Streak Stats</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Current Streak</span>
                      <span className="text-sm font-medium">15 days 🔥</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 w-[75%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Longest Streak</span>
                      <span className="text-sm font-medium">28 days</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 w-full rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Weekly Goal</span>
                      <span className="text-sm font-medium">12/15 problems</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 w-[80%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button size="sm" className="md:size-default">Get Custom Prompt</Button>
        </div>
      </div>
    </div>
  )
}
