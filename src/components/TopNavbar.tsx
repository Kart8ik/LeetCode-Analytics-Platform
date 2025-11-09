import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sun, Moon, LayoutDashboard, Trophy} from 'lucide-react'
import LogoLight from '@/assets/images/icons/logo-icon-whitebg1.png'
import LogoDark from '@/assets/images/icons/logo-icon-blackbg.png'
import { supabase } from '@/lib/supabase'
import {toast} from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function TopNavbar() {
  const [isDark, setIsDark] = useState<boolean>(false)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAuth()


  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = stored ? stored === 'dark' : prefersDark
      setIsDark(initial)
      if (initial) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch {
      // ignore theme read errors
    }
  }, [])
 
  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // ignore localStorage write errors
    }
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      // Try a global sign-out first; if the session is missing/invalid, fall back to local
      const { error } = await supabase.auth.signOut()
      if (error) {
        await supabase.auth.signOut({ scope: 'local' })
      }
      toast.success('Logged out')
      navigate('/login')
    } catch {
      toast.error('Failed to log out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={isDark ? LogoLight : LogoDark} 
            alt="LeetTrack Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
          />
          <div>
            {role === 'admin' && (
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LeetTrack<span className="text-primary"> Admin</span></h1>
            )}
            {role === 'user' && (
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LeetTrack</h1>
            )}
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Track your coding journey with your friends
            </p>
          </div>
        </div>
        {role === 'user' && (
          <>
        {/* Navigation Buttons - Centered on desktop, below logo on mobile */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex">
          <div className="inline-flex items-center gap-0 rounded-lg border-2 border-secondary p-1 bg-background">
            <Link to="/dashboard">
              <Button 
                variant={location.pathname === '/dashboard' ? 'default' : 'ghost'} 
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
        </div>
        </>
        )}

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

          <Button
            size="sm"
            className="md:size-default"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </header>
  )
}