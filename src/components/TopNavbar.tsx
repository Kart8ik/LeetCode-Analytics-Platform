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
import { supabase } from '@/lib/supabase'
import {toast} from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function TopNavbar() {
  const [isDark, setIsDark] = useState<boolean>(false)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { role, user } = useAuth()

  const [currentStreak, setCurrentStreak] = useState<number | null>(null)
  const [longestStreak, setLongestStreak] = useState<number | null>(null)
  const [weeklySolved, setWeeklySolved] = useState<number | null>(null)
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null)
  const [problemCounts, setProblemCounts] = useState<{ easy?: number; medium?: number; hard?: number; total?: number } | null>(null)
  const [topLanguages, setTopLanguages] = useState<Array<{ language?: string; solved?: number }> | null>(null)
  const [topTopics, setTopTopics] = useState<Array<{ topic?: string; count?: number }> | null>(null)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_details', {
          p_user_id: user.id,
        })
        if (error) return

        // RPC may return an object or an array; normalize
        const payload = Array.isArray(data) ? data[0] : data
        if (!payload || cancelled) return

        // Normalize fields from top-level or nested objects (RPC returns problem_stats, progress_stats, etc.)
        const progress = payload.progress_stats ?? payload.progress ?? {}
        const problems = payload.problem_stats ?? payload.problems ?? {}
        const languages = payload.language_stats ?? []
        const topics = payload.topic_stats ?? payload.topic_stats ?? payload.topic_stats ?? []

        // Try common field names; fall back to nested progress_stats
        const maybeCurrent =
          typeof payload.current_streak === 'number'
            ? payload.current_streak
            : typeof payload.streak_count === 'number'
            ? payload.streak_count
            : typeof progress.streak_count === 'number'
            ? progress.streak_count
            : null

        const maybeLongest =
          typeof payload.longest_streak === 'number'
            ? payload.longest_streak
            : typeof progress.longest_streak === 'number'
            ? progress.longest_streak
            : null

        const maybeWeeklySolved =
          typeof payload.weekly_solved === 'number'
            ? payload.weekly_solved
            : typeof progress.weekly_solved === 'number'
            ? progress.weekly_solved
            : null

        const maybeWeeklyGoal =
          typeof payload.weekly_goal === 'number'
            ? payload.weekly_goal
            : typeof progress.weekly_goal === 'number'
            ? progress.weekly_goal
            : null

        setCurrentStreak(maybeCurrent)
        setLongestStreak(maybeLongest)
        setWeeklySolved(maybeWeeklySolved)
        setWeeklyGoal(maybeWeeklyGoal)

        // Problem counts (easy/medium/hard). Accept several possible field names.
        const easy =
          typeof problems.easy === 'number'
            ? problems.easy
            : typeof problems.easy_count === 'number'
            ? problems.easy_count
            : typeof problems.easy_solved === 'number'
            ? problems.easy_solved
            : undefined
        const medium =
          typeof problems.medium === 'number'
            ? problems.medium
            : typeof problems.medium_count === 'number'
            ? problems.medium_count
            : typeof problems.medium_solved === 'number'
            ? problems.medium_solved
            : undefined
        const hard =
          typeof problems.hard === 'number'
            ? problems.hard
            : typeof problems.hard_count === 'number'
            ? problems.hard_count
            : typeof problems.hard_solved === 'number'
            ? problems.hard_solved
            : undefined

        const total =
          typeof problems.total === 'number'
            ? problems.total
            : typeof problems.total_solved === 'number'
            ? problems.total_solved
            : [easy, medium, hard].reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)

        setProblemCounts({ easy, medium, hard, total })

        // Top languages/topics arrays (take up to 3 to show)
        try {
          const langs = Array.isArray(languages)
            ? languages.slice(0, 3).map((l: unknown) => {
                const obj = l as Record<string, unknown>
                const language = typeof obj.language === 'string' ? obj.language : typeof obj.name === 'string' ? obj.name : undefined
                const solved = typeof obj.solved === 'number' ? obj.solved : typeof obj.count === 'number' ? obj.count : undefined
                return { language, solved }
              })
            : []
          const tpcs = Array.isArray(topics)
            ? topics.slice(0, 3).map((t: unknown) => {
                const obj = t as Record<string, unknown>
                const topic = typeof obj.topic === 'string' ? obj.topic : typeof obj.name === 'string' ? obj.name : undefined
                const count = typeof obj.count === 'number' ? obj.count : typeof obj.solved === 'number' ? obj.solved : undefined
                return { topic, count }
              })
            : []
          setTopLanguages(langs)
          setTopTopics(tpcs)
        } catch {
          setTopLanguages(null)
          setTopTopics(null)
        }
      } catch {
        // ignore errors fetching hover data
      }
    }
    fetchStats()
    return () => {
      cancelled = true
    }
  }, [user?.id])

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6 py-4">
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
        {role === 'user' && ( // admin can see only leaderboard
          <>
        {/* Navigation Buttons */}
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
                      <span className="text-sm font-medium">
                        {currentStreak != null ? `${currentStreak} days 🔥` : '—'}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min(100, currentStreak != null ? (currentStreak / Math.max(1, longestStreak ?? currentStreak)) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Longest Streak</span>
                      <span className="text-sm font-medium">{longestStreak != null ? `${longestStreak} days` : '—'}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 w-full rounded-full bg-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Weekly Goal</span>
                      <span className="text-sm font-medium">{weeklySolved != null && weeklyGoal != null ? `${weeklySolved}/${weeklyGoal} problems` : '—'}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${weeklyGoal ? Math.min(100, (Number(weeklySolved ?? 0) / Number(weeklyGoal)) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* Problem summary + top languages/topics from RPC */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Problems (E,M,H)</span>
                    <span className="text-sm font-medium">{problemCounts ? `${problemCounts.easy ?? 0}, ${problemCounts.medium ?? 0}, ${problemCounts.hard ?? 0}` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Total Solved</span>
                    <span className="text-sm font-medium">{problemCounts?.total ?? '—'}</span>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm text-muted-foreground">Top Languages</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {topLanguages && topLanguages.length ? (
                        topLanguages.map((l, i) => (
                          <span key={`${l.language ?? 'lang'}-${i}`} className="text-sm font-medium">
                            {l.language ?? '—'}{l.solved != null ? ` (${l.solved})` : ''}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm">—</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">Top Topics</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {topTopics && topTopics.length ? (
                        topTopics.map((t, i) => (
                          <span key={`${t.topic ?? 'topic'}-${i}`} className="text-sm font-medium">
                            {t.topic ?? '—'}{t.count != null ? ` (${t.count})` : ''}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <Button size="sm" className="md:size-default">Get Custom Prompt</Button>
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