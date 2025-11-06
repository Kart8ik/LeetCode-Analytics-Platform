import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Pages/ui/card'
import { Button } from '@/components/Pages/ui/button'
import { Input } from '@/components/Pages/ui/input'
import { Separator } from '@/components/Pages/ui/separator'
import { Trophy, Medal, Flame } from 'lucide-react'
import TopNavbar from '@/components/Pages/Header/TopNavbar'

// Simple avatar fallback with initials
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
      {initials}
    </div>
  )
}

// Row data shape
type Leader = {
  id: number
  name: string
  handle: string
  solved: number
  streak: number
  lastSolve: string
}

const SAMPLE_DATA: Leader[] = [
  { id: 1, name: 'Alice Johnson', handle: '@alice', solved: 312, streak: 21, lastSolve: '2h ago' },
  { id: 2, name: 'Rahul Mehta', handle: '@rahul', solved: 289, streak: 15, lastSolve: '5h ago' },
  { id: 3, name: 'Sofia Li', handle: '@sofia', solved: 275, streak: 30, lastSolve: '1h ago' },
  { id: 4, name: 'Diego Martínez', handle: '@diego', solved: 241, streak: 7, lastSolve: '1d ago' },
  { id: 5, name: 'Emily Chen', handle: '@emily', solved: 230, streak: 11, lastSolve: '3h ago' },
]

export default function Leaderboard() {
  const [query, setQuery] = useState('')
  const [range, setRange] = useState<'week' | 'month' | 'all'>('month')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = [...SAMPLE_DATA]
    // Sort by solved desc, then streak desc
    base.sort((a, b) => (b.solved - a.solved) || (b.streak - a.streak))
    if (!q) return base
    return base.filter((r) => r.name.toLowerCase().includes(q) || r.handle.toLowerCase().includes(q))
  }, [query])

  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 p-4 md:p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">Track top performers by problems solved and streaks.</p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <CardTitle className="text-xl">Rankings</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="inline-flex rounded-md bg-muted p-1">
                <Button
                  variant={range === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRange('week')}
                >
                  This week
                </Button>
                <Button
                  variant={range === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRange('month')}
                >
                  This month
                </Button>
                <Button
                  variant={range === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRange('all')}
                >
                  All time
                </Button>
              </div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full sm:w-64"
              />
            </div>
          </div>
          <CardDescription>
            {range === 'week' && 'Showing weekly leaderboard'}
            {range === 'month' && 'Showing monthly leaderboard'}
            {range === 'all' && 'Showing all-time leaderboard'}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-normal pb-3">Rank</th>
                  <th className="text-left font-normal pb-3">User</th>
                  <th className="text-right font-normal pb-3">Solved</th>
                  <th className="text-right font-normal pb-3">Streak</th>
                  <th className="text-right font-normal pb-3">Last solve</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => {
                  const rank = idx + 1
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {rank === 1 ? (
                            <Medal className="h-4 w-4 text-yellow-500" />
                          ) : rank === 2 ? (
                            <Medal className="h-4 w-4 text-gray-400" />
                          ) : rank === 3 ? (
                            <Medal className="h-4 w-4 text-amber-700" />
                          ) : (
                            <span className="text-muted-foreground">{rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.name} />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{row.name}</span>
                            <span className="text-xs text-muted-foreground">{row.handle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">{row.solved}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Flame className={`h-4 w-4 ${row.streak >= 20 ? 'text-orange-500' : row.streak >= 10 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                          <span className="tabular-nums">{row.streak}d</span>
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{row.lastSolve}</td>
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
