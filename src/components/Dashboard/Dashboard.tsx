import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExampleChart } from '@/components/Charts/ExampleChart'
import { Button } from '@/components/ui/button'

const Dashboard = () => {
  return (
    <div className="space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ml-14">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LeetTrack</h1>
            <p className="text-muted-foreground mt-1">Track your coding journey</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Stats</Button>
          <Button>Add Problem</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Solved</CardDescription>
            <CardTitle className="text-2xl">245</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Easy Problems</CardDescription>
            <CardTitle className="text-2xl">145</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">59% completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Medium Problems</CardDescription>
            <CardTitle className="text-2xl">87</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">41% completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Hard Problems</CardDescription>
            <CardTitle className="text-2xl">13</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Solving Progress</CardTitle>
            <CardDescription>Monthly problem solving statistics</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ExampleChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
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
                <div key={i} className="flex items-center gap-4">
                  <div className={`flex size-9 items-center justify-center rounded-full font-semibold text-sm ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {problem.status}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{problem.name}</p>
                    <p className="text-sm text-muted-foreground">{problem.difficulty}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{problem.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Streak Stats</CardTitle>
            <CardDescription>Your consistency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <span className="text-sm font-medium">15 days 🔥</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[75%] rounded-full bg-primary"></div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">Longest Streak</span>
                <span className="text-sm font-medium">28 days</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-full rounded-full bg-primary"></div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">Weekly Goal</span>
                <span className="text-sm font-medium">12/15 problems</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[80%] rounded-full bg-primary"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Random Problem
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Review Notes
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View Achievements
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Plan</CardTitle>
            <CardDescription>Upcoming topics to focus on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-sm font-medium">Arrays & Hashing</p>
                <p className="text-xs text-muted-foreground mt-1">5 problems remaining</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-sm font-medium">Dynamic Programming</p>
                <p className="text-xs text-muted-foreground mt-1">12 problems remaining</p>
              </div>
              <div className="rounded-lg bg-accent p-3">
                <p className="text-sm font-medium">Graph Algorithms</p>
                <p className="text-xs text-muted-foreground mt-1">8 problems remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard