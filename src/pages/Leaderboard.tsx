import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { Medal, ArrowUpDown } from 'lucide-react'
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
  section?: string
  semester?: string
  easy_solved: number
  medium_solved: number
  hard_solved: number
  total_solved: number
  streak_count: number
  global_rank?: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [query, setQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<
    'global_rank' | 'total_solved' | 'easy_solved' | 'medium_solved' | 'hard_solved' | 'streak_count'
  >('total_solved')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { role } = useAuth()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase.rpc('get_leaderboard_json')
      if (error) {
        toast.error(error.message)
      } else {
        setLeaderboard(data || [])
        toast.success('Leaderboard fetched successfully')
      }
    }
    fetchLeaderboard()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = leaderboard.filter((u) =>
      [u.real_name, u.username, u.section, u.semester]
        .filter(Boolean)
        .some((val) => val!.toLowerCase().includes(q))
    )

    base.sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    return base
  }, [query, leaderboard, sortColumn, sortOrder])

  const Avatar = ({ name }: { name: string }) => {
    const initials = name
      ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : '?'
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
        {initials}
      </div>
    )
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const downloadCSV = () => {
    if (!filtered || filtered.length === 0) {
      toast('No data to download')
      return
    }

    const headers = [
      'rank',
      'user_id',
      'username',
      'real_name',
      'easy_solved',
      'medium_solved',
      'hard_solved',
      'total_solved',
      'streak_count',
      'global_rank',
      'section',
      'semester',
    ]

    const rows = filtered.map((u, idx) => [
      String(idx + 1),
      u.user_id,
      u.username,
      u.real_name,
      String(u.easy_solved),
      String(u.medium_solved),
      String(u.hard_solved),
      String(u.total_solved),
      String(u.streak_count),
      u.global_rank != null ? String(u.global_rank) : '-',
      u.section ?? '-',
      u.semester ?? '-',
    ])

    const csvContent = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'leaderboard.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 px-4 md:px-8 py-6 bg-background">
        <Card className="overflow-hidden shadow-md border">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              🏆 Leaderboard
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, section, or semester..."
                className="w-full sm:w-64"
              />
              <div className="w-full sm:w-48">
                <label htmlFor="sortColumn" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sortColumn"
                  value={sortColumn}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSortColumn(e.target.value as typeof sortColumn)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="global_rank">Global Rank</option>
                  <option value="total_solved">Total Solved</option>
                  <option value="easy_solved">Easy</option>
                  <option value="medium_solved">Medium</option>
                  <option value="hard_solved">Hard</option>
                  <option value="streak_count">Streak</option>
                </select>
              </div>
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              {role === 'admin' && (
                <Button variant="default" onClick={downloadCSV}>
                  Download CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-[900px] w-full border-collapse text-sm">
                <thead>
                  <tr className="text-muted-foreground bg-muted/40 text-center">
                    <th className="py-3 px-3 text-left">#</th>
                    <th className="py-3 px-3 text-left">User</th>
                    <th className="py-3 px-3 text-center">Easy</th>
                    <th className="py-3 px-3 text-center">Medium</th>
                    <th className="py-3 px-3 text-center">Hard</th>
                    <th className="py-3 px-3 text-center">Total</th>
                    <th className="py-3 px-3 text-center">Streak</th>
                    <th className="py-3 px-3 text-center">Global Rank</th>
                    <th className="py-3 px-3 text-center">Section</th>
                    <th className="py-3 px-3 text-center">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => {
                    const rank = idx + 1
                    const highlight =
                      rank === 1
                        ? 'bg-yellow-50 dark:bg-yellow-900/10'
                        : rank === 2
                        ? 'bg-gray-50 dark:bg-gray-800/30'
                        : rank === 3
                        ? 'bg-amber-50 dark:bg-amber-900/10'
                        : ''
                    return (
                      <tr
                        key={user.user_id}
                        className={`border-b hover:bg-muted/10 transition-colors text-center ${highlight}`}
                      >
                        <td className="py-3 text-left pl-3 font-semibold text-muted-foreground">
                          {rank <= 3 ? (
                            <Medal
                              className={`h-4 w-4 ${
                                rank === 1
                                  ? 'text-yellow-500'
                                  : rank === 2
                                  ? 'text-gray-400'
                                  : 'text-amber-700'
                              }`}
                            />
                          ) : (
                            rank
                          )}
                        </td>
                        <td className="py-3 text-left flex items-center gap-3">
                          <Avatar name={user.real_name} />
                          <div className="text-left">
                            <div className="font-medium truncate max-w-[150px]">
                              {user.real_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{user.easy_solved}</td>
                        <td className="py-3">{user.medium_solved}</td>
                        <td className="py-3">{user.hard_solved}</td>
                        <td className="py-3 font-semibold text-foreground">
                          {user.total_solved}
                        </td>
                        <td className="py-3">{user.streak_count}</td>
                        <td className="py-3">{user.global_rank ?? '-'}</td>
                        <td className="py-3">{user.section ?? '-'}</td>
                        <td className="py-3">{user.semester ?? '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}