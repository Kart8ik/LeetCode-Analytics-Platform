import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Medal } from 'lucide-react'
import TopNavbar from '@/components/TopNavbar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const fetchLeaderboard = async () => {
  const { data, error } = await supabase.rpc('get_leaderboard_json')
  if (error) {
    toast.error(error.message)
  } else {
    console.log("leaderboard", data)
    toast.success("Leaderboard fetched successfully")
  }
}
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
type Leaderb = {
  id: number
  name: string
  handle: string
  easy: number
  medium: number
  hard: number
  total: number
  streak: number
  lastSolve: string
}



const SAMPLE_DATA: Leaderb[] = [
  { id: 1, name: 'Alice Johnson', handle: '@alice', easy: 150, medium: 120, hard: 42, total: 312, streak: 21, lastSolve: '2h ago' },
  { id: 2, name: 'Rahul Mehta', handle: '@rahul', easy: 145, medium: 105, hard: 39, total: 289, streak: 15, lastSolve: '5h ago' },
  { id: 3, name: 'Sofia Li', handle: '@sofia', easy: 140, medium: 98, hard: 37, total: 275, streak: 30, lastSolve: '1h ago' },
  { id: 4, name: 'Diego Martínez', handle: '@diego', easy: 125, medium: 85, hard: 31, total: 241, streak: 7, lastSolve: '1d ago' },
  { id: 5, name: 'Emily Chen', handle: '@emily', easy: 120, medium: 80, hard: 30, total: 230, streak: 11, lastSolve: '3h ago' },
]

export default function Leaderboard() {
  const [query, setQuery] = useState('')
  const { role } = useAuth();
  console.log('role', role);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = [...SAMPLE_DATA]
    // Sort by total desc, then streak desc
    base.sort((a, b) => (b.total - a.total) || (b.streak - a.streak))
    if (!q) return base
    return base.filter((r) => r.name.toLowerCase().includes(q) || r.handle.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6 bg-background">
        {/* Header */}
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <CardTitle className="text-xl">Rankings</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                {role === 'admin' && <Button variant="default">Download CSV</Button>}
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left font-normal pb-3">Rank</th>
                    <th className="text-left font-normal pb-3">User</th>
                    <th className="text-right font-normal pb-3">Easy</th>
                    <th className="text-right font-normal pb-3">Medium</th>
                    <th className="text-right font-normal pb-3">Hard</th>
                    <th className="text-right font-normal pb-3">Total</th>
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
                        <td className="py-3 text-right font-medium">{row.easy}</td>
                        <td className="py-3 text-right font-medium">{row.medium}</td>
                        <td className="py-3 text-right font-medium">{row.hard}</td>
                        <td className="py-3 text-right font-semibold">{row.total}</td>
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