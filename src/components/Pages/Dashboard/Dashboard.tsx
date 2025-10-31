import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Pages/ui/card'
import { ExampleChart } from '@/components/Pages/Charts/ExampleChart'
import { Button } from '@/components/Pages/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/Pages/ui/hover-card"
import { Zap } from "lucide-react"
const Dashboard = () => {
  return (
    <div className="w-full space-y-6 p-4 md:p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LeetTrack</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your coding journey</p>
          </div>
        </div>
        <div className="flex gap-2">
            <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline" size="sm" className="md:size-default">
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
          <Button variant="outline" size="sm" className="md:size-default">Export Stats</Button>
          <Button size="sm" className="md:size-default">Add Problem</Button>
        </div>
      </div>

      {/* Flexbox 1: Stats Cards - Total Solved, Easy, Medium, Hard */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Card className="flex-1">
          <CardHeader>
            <CardDescription>Total Solved</CardDescription>
            <CardTitle className="text-2xl">245</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardDescription>Easy Problems</CardDescription>
            <CardTitle className="text-2xl">145</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">59% completion</p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardDescription>Medium Problems</CardDescription>
            <CardTitle className="text-2xl">87</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">41% completion</p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardDescription>Hard Problems</CardDescription>
            <CardTitle className="text-2xl">13</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+3 this month</p>
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
                  <div className={`flex size-8 sm:size-9 items-center justify-center rounded-full font-semibold text-xs sm:text-sm shrink-0 ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
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
          
        </Card>
      </div>
    </div>
  )
}

export default Dashboard