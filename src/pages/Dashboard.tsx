
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExampleChart } from '@/components/ExampleChart'
import TopNavbar from '@/components/TopNavbar'

const Dashboard = () => {

  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6 bg-background">
        {/* Header */}
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

          </Card>
        </div>
      </div>
    </>
  )
}

export default Dashboard