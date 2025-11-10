import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Medal } from 'lucide-react'
import TopNavbar from '@/components/TopNavbar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type LeaderboardUser = {
  user_id: string
  username: string
  real_name: string
  user_url?: string
  section?: string | number
  semester?: string | number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  total_solved: number
  streak_count: number
  global_rank?: number | null
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFiltering, setIsFiltering] = useState<boolean>(false)
  const [query, setQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<
    'global_rank' | 'total_solved' | 'easy_solved' | 'medium_solved' | 'hard_solved' | 'streak_count'
  >('global_rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterSection, setFilterSection] = useState<string | 'all'>('all')
  const [filterSemester, setFilterSemester] = useState<string | 'all'>('all')
  const { role } = useAuth()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_leaderboard_json')
        if (error) {
          toast.error(error.message)
        } else {
          setLeaderboard(data || [])
          toast.success('Leaderboard fetched successfully')
        }
      } catch {
        toast.error('Failed to fetch leaderboard')
      } finally {
        setIsLoading(false)
      setIsLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_leaderboard_json')
        if (error) {
          toast.error(error.message)
        } else {
          setLeaderboard(data || [])
          toast.success('Leaderboard fetched successfully')
        }
      } catch {
        toast.error('Failed to fetch leaderboard')
      } finally {
        setIsLoading(false)
      }
    }
    }


    fetchLeaderboard()
  }, [])

  const sections = useMemo(() => {
    return Array.from(new Set(leaderboard.map(u => u.section).filter(Boolean))).sort()
  }, [leaderboard])

  const semesters = useMemo(() => {
    return Array.from(new Set(leaderboard.map(u => u.semester).filter(Boolean))).sort()
  }, [leaderboard])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const base = leaderboard.filter(u => {
      const matchesQuery = [u.real_name, u.username, u.section, u.semester]
        .some(val => String(val ?? '').toLowerCase().includes(q))
      const matchesSection = filterSection === 'all' || String(u.section) === String(filterSection)
      const matchesSemester = filterSemester === 'all' || String(u.semester) === String(filterSemester)
      return matchesQuery && matchesSection && matchesSemester
    })

    // Primary sort by selected column (global_rank special-cased)
    base.sort((a, b) => {
      if (sortColumn === 'global_rank') {
        const aGlobal = typeof a.global_rank === 'number' ? a.global_rank : Infinity
        const bGlobal = typeof b.global_rank === 'number' ? b.global_rank : Infinity
        return sortOrder === 'asc' ? aGlobal - bGlobal : bGlobal - aGlobal
      }

      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })

    return base
  }, [leaderboard, query, filterSection, filterSemester, sortColumn, sortOrder])

  // Show a quick filtering indicator when query/filters/sort change
  useEffect(() => {
    // Don't show filtering overlay during initial load
    if (isLoading) return
    setIsFiltering(true)
    const id = window.setTimeout(() => setIsFiltering(false), 180)
    return () => clearTimeout(id)
  }, [query, filterSection, filterSemester, sortColumn, sortOrder, leaderboard, isLoading])

  // Map of DB rank (position in the fetched leaderboard array)
  const dbRankMap = useMemo(() => {
    const m = new Map<string, number>()
    leaderboard.forEach((u, i) => {
      if (u.user_id) m.set(u.user_id, i + 1)
    })
    return m
  }, [leaderboard])

  // Avatar removed — leaderboard shows medal + DB rank in the left column

  const clearFilters = () => {
    setQuery('')
    setFilterSection('all')
    setFilterSemester('all')
    setSortColumn('global_rank')
    setSortOrder('asc')
  }

  const downloadCSV = () => {
    if (!filtered.length) {
      toast('No data to download')
      return
    }

    const headers = [
      'rank', 'user_id', 'username', 'real_name', 'easy_solved',
      'medium_solved', 'hard_solved', 'total_solved', 'streak_count',
      'global_rank', 'section', 'semester'
    ]

    const rows = filtered.map(u => [
      dbRankMap.get(u.user_id) ?? '-',
      u.user_id,
      u.username,
      u.real_name,
      u.easy_solved,
      u.medium_solved,
      u.hard_solved,
      u.total_solved,
      u.streak_count,
      u.global_rank ?? '-',
      u.section ?? '-',
      u.semester ?? '-',
    ])

    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'leaderboard.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }



  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6 bg-background">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-semibold tracking-tight">Leaderboard</CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name"
                className="w-full sm:w-64"
              />

              <div className="flex items-center gap-2">
                <Select
                  value={sortColumn}
                  onValueChange={(v: string) => setSortColumn(v as typeof sortColumn)}
                >
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global_rank">Global Rank</SelectItem>
                    <SelectItem value="total_solved">Total Solved</SelectItem>
                    <SelectItem value="easy_solved">Easy</SelectItem>
                    <SelectItem value="medium_solved">Medium</SelectItem>
                    <SelectItem value="hard_solved">Hard</SelectItem>
                    <SelectItem value="streak_count">Streak</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(v: string) => setSortOrder(v as 'asc' | 'desc')}>
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'admin' && (
                <>
                  <Select
                    value={filterSection}
                    onValueChange={(v: string) => setFilterSection((v as string) || 'all')}
                  >
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map(s => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterSemester}
                    onValueChange={(v: string) => setFilterSemester((v as string) || 'all')}
                  >
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map(s => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>

                  <Button variant="default" onClick={downloadCSV}>
                    Download CSV
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 overflow-x-auto rounded-lg relative">
            {isLoading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block rounded-full animate-spin border-4 border-gray-200 border-t-primary w-12 h-12" />
                  <div className="mt-3 text-sm text-muted-foreground">Loading leaderboard…</div>
                </div>
              </div>
            ) : (
              <>
                {isFiltering && (
                  <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur flex items-center justify-center">
                    <div className="inline-block rounded-full animate-spin border-4 border-gray-200 border-t-primary w-10 h-10" />
                  </div>
                )}

                <table className={`min-w-[900px] w-full border-collapse text-sm ${isFiltering ? 'opacity-60' : ''}`}>
                  <thead>
                    <tr className="text-muted-foreground bg-muted/40 text-center">
                      <th className="py-3 px-3 text-left">Rank</th>
                      <th className="py-3 px-3 text-left w-[50%]">Leader</th>
                      <th className="py-3 px-3 text-center">Global Rank</th>
                      <th className="py-3 px-3 text-center">E,M,H</th>
                      <th className="py-3 px-3 text-center">Total</th>
                      <th className="py-3 px-3 text-center">Streak</th>
                      <th className="py-3 px-3 text-center">Sem Sec</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, _idx) => {
                      const dbRankNum = dbRankMap.get(user.user_id)
                      const dbRank = dbRankNum ?? '-'
                      const sem = user.semester ?? ''
                      const sec = user.section ?? ''
                      const semSec = sem || sec ? `${sem}${sem && sec ? ' ' : ''}${sec}` : '-'
                      const highlight = dbRankNum === 1
                        ? 'bg-yellow-50 dark:bg-yellow-900/10'
                        : dbRankNum === 2
                          ? 'bg-gray-50 dark:bg-gray-800/30'
                          : dbRankNum === 3
                            ? 'bg-amber-50 dark:bg-amber-900/10'
                            : ''

                      // Ensure a stable key even if test fixtures use `id` instead of `user_id`
                      const rowKey = user.user_id ?? (user as any).id ?? user.username ?? `row-${_idx}`

                      return (
                        <tr
                          key={rowKey}
                          className={`border-b hover:bg-muted/10 transition-colors text-center ${highlight}`}
                        >
                          <td className="py-3 text-left pl-3 font-semibold text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {dbRankNum && dbRankNum <= 3 ? (
                                <>
                                  {dbRankNum === 1 ? (
                                    <Medal className="h-4 w-4 text-yellow-500" />
                                  ) : dbRankNum === 2 ? (
                                    <Medal className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Medal className="h-4 w-4 text-amber-700" />
                                  )}
                                  <span className="text-sm font-medium">{dbRank}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">{dbRank}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 text-left w-[50%]">
                            <div>
                              <div className="font-medium truncate max-w-[600px]">{user.real_name}</div>
                              <div className="text-xs text-muted-foreground">@{user.username}</div>
                            </div>
                          </td>

                          <td className="py-3 text-center">{user.global_rank ?? '-'}</td>

                          <td className="py-3 text-center">
                            <div className="inline-flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">{user.easy_solved}</span>
                              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">{user.medium_solved}</span>
                              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">{user.hard_solved}</span>
                            </div>
                          </td>

                          <td className="font-semibold">{user.total_solved}</td>
                          <td>{user.streak_count}</td>
                          <td>{semSec}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}