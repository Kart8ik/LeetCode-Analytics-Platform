import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sun, Moon, LayoutDashboard, Trophy } from 'lucide-react'
import LogoLight from '@/assets/images/icons/logo-icon-whitebg1.png'
import LogoDark from '@/assets/images/icons/logo-icon-blackbg.png'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {Spinner} from '@/components/ui/spinner'

export default function TopNavbar() {
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { role, isDark, toggleTheme } = useAuth()

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy }
    ],
    []
  )

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

  const actionButtons = (
    <>
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
        className="md:size-default hidden sm:block"
        variant="outline"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? <Spinner className="h-4 w-4" /> : 'Logout'}
      </Button>
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative flex w-full flex-col gap-4 px-4 py-4 md:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <div className="flex items-center gap-3">
              <img
                src={isDark ? LogoLight : LogoDark}
                alt="LeetTrack Logo"
                className="h-10 w-10 rounded-lg md:h-12 md:w-12"
              />
              <div>
                {role === 'admin' && (
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    LeetTrack<span className="text-primary"> Admin</span>
                  </h1>
                )}
                {role === 'user' && <h1 className="text-2xl font-bold tracking-tight md:text-3xl">LeetTrack</h1>}
                <p className="mt-1 text-sm text-muted-foreground md:text-base hidden sm:block">
                  Track your coding journey with your friends
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:hidden">{actionButtons}</div>
          </div>

          {role === 'user' && (
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:flex">
              <div className="inline-flex items-center gap-0 rounded-lg border-2 border-secondary bg-background p-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to
                  return (
                    <Link key={to} to={to}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2 rounded-md"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          <div className="hidden items-center gap-3 sm:flex">{actionButtons}</div>
        </div>
      </header>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden">
          <div className="flex items-center justify-evenly px-4 py-3">
          {role === 'user' && (
            <div className="inline-flex items-center gap-0 rounded-lg border-2 border-secondary bg-background p-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to
              return (
                <Link key={to} to={to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2 rounded-md"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              )
            })}
            </div>
          )}
            <Button
              size="sm"
              className="md:size-default"
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Spinner className="h-4 w-4" /> : 'Logout'}
            </Button>
          </div>
        </nav>
    </>
  )
}