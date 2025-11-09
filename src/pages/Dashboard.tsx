
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExampleChart } from '@/components/ExampleChart'
import { useEffect, useState } from 'react'
import TopNavbar from '@/components/TopNavbar'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '@/components/ui/loading'

type UserDetails = {
  real_name?: string
  username?: string
  section?: string | number
  semester?: string | number
  problem_stats?: {
    easy?: number
    medium?: number
    hard?: number
    total?: number
    total_solved?: number
    easy_solved?: number
    medium_solved?: number
    hard_solved?: number
  }
  progress_stats?: {
    weekly_solved?: number
    weekly_goal?: number
    monthly_solved?: number
    streak_count?: number
    longest_streak?: number
  }
  total_solved?: number
  streak_count?: number
}

const Dashboard = () => {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [details, setDetails] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (role === 'admin') {
      navigate('/leaderboard')
      return
    }

    const fetchUserDetails = async () => {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_user_details', {
          p_user_id: user.id,
        })
        if (error) {
          // permission or other error
          toast.error(error.message)
          return
        }

        const payload = Array.isArray(data) ? data[0] : data
        if (!payload) {
          setDetails(null)
          toast.error('No user data returned')
          return
        }

        setDetails(payload)
        toast.success('User details fetched successfully')
      } catch {
        toast.error('Failed to fetch user details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [user, role, navigate])

  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6 bg-background">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold">{details?.real_name ?? details?.username ?? user?.email ?? 'Your dashboard'}</h2>
          <div className="text-xs text-muted-foreground">{details ? `${details.semester ?? ''}${details.semester && details.section ? ' ' : ''}${details.section ?? ''}` : ''}</div>
        </div>
        {/* Flexbox 1: Stats Cards - Total Solved, Easy, Medium, Hard */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Card className="flex-1">
            <CardHeader>
              <CardDescription>Total Solved</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? <LoadingSpinner size="sm" /> : (details?.problem_stats?.total ?? details?.problem_stats?.total_solved ?? details?.total_solved ?? ([details?.problem_stats?.easy, details?.problem_stats?.medium, details?.problem_stats?.hard].reduce((a:number,b: unknown) => a + Number(b ?? 0), 0) || '—'))}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{details?.progress_stats?.weekly_solved != null && details?.progress_stats?.weekly_goal != null ? `+${details.progress_stats.weekly_solved} this week` : '—'}</p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardDescription>Easy Problems</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? <LoadingSpinner size="sm" /> : (details?.problem_stats?.easy ?? details?.problem_stats?.easy_solved ?? '—')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{details?.problem_stats ? `${Math.round(((details.problem_stats.easy ?? 0) / Math.max(1, details.problem_stats.total ?? (details.problem_stats.easy ??0) + (details.problem_stats.medium ??0) + (details.problem_stats.hard ??0))) * 100)}% completion` : '—'}</p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardDescription>Medium Problems</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? <LoadingSpinner size="sm" /> : (details?.problem_stats?.medium ?? details?.problem_stats?.medium_solved ?? '—')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{details?.problem_stats ? `${Math.round(((details.problem_stats.medium ?? 0) / Math.max(1, details.problem_stats.total ?? (details.problem_stats.easy ??0) + (details.problem_stats.medium ??0) + (details.problem_stats.hard ??0))) * 100)}% completion` : '—'}</p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardDescription>Hard Problems</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? <LoadingSpinner size="sm" /> : (details?.problem_stats?.hard ?? details?.problem_stats?.hard_solved ?? '—')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{details?.progress_stats?.monthly_solved != null ? `+${details.progress_stats.monthly_solved} this month` : '—'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Flexbox 2: Chart Section */}
        <div className="flex w-full">
          <Card className="flex-1 w-full">
            <CardHeader>
              <CardTitle>Solving Progress</CardTitle>
              <CardDescription>Monthly problem solving statistics</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ExampleChart />
            </CardContent>
          </Card>
        </div>

        {/* Flexbox 3: Recent Submissions and Streak Stats */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your latest solved problems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Two Sum', difficulty: 'Easy', time: '2 hours ago', status: '✓' },
                  { name: 'Valid Parentheses', difficulty: 'Easy', time: '5 hours ago', status: '✓' },
                  { name: 'Merge Intervals', difficulty: 'Medium', time: '1 day ago', status: '✓' },
                  { name: 'Binary Tree Paths', difficulty: 'Medium', time: '2 days ago', status: '✓' },
                  { name: 'Trapping Rain Water', difficulty: 'Hard', time: '3 days ago', status: '✓' },
                ].map((problem, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-4">
                    <div className={`flex size-8 sm:size-9 items-center justify-center rounded-full font-semibold text-xs sm:text-sm shrink-0 ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                      {problem.status}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{problem.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{problem.difficulty}</p>
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{problem.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Streak Stats</CardTitle>
              <CardDescription>Your consistency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                    <span className="text-sm font-medium">{isLoading ? <LoadingSpinner size="sm" /> : (details?.progress_stats?.streak_count ?? details?.streak_count ?? '—')}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(100, details?.progress_stats?.streak_count ? (Number(details.progress_stats.streak_count) / Math.max(1, Number(details.progress_stats.longest_streak ?? details.progress_stats.streak_count ?? 1))) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Longest Streak</span>
                  <span className="text-sm font-medium">{details?.progress_stats?.longest_streak ?? '—'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Solved</span>
                  <span className="text-sm font-medium">{details?.progress_stats?.weekly_solved ?? '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Dashboard