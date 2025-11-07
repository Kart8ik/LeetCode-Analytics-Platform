import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Sun, Moon, Zap, LayoutDashboard, Trophy } from 'lucide-react'
import LogoLight from '@/assets/images/icons/logo-icon-whitebg1.png'
import LogoDark from '@/assets/images/icons/logo-icon-blackbg.png'

export default function TopNavbar() {
  const [isDark, setIsDark] = useState<boolean>(false)
  const location = useLocation()

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
              Track your coding journey
            </p>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="inline-flex items-center gap-0 rounded-lg border-2 border-secondary p-1 bg-background">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2 rounded-md"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button 
              variant={location.pathname === '/leaderboard' ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2 rounded-md"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
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
          <Button size="sm" className="md:size-default" variant="outline">Logout</Button>
        </div>
      </div>
    </header>
  )
}