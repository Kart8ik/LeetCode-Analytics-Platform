
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExampleChart } from '@/components/ExampleChart'
import { useEffect, useState, useMemo, useRef } from 'react'
import TopNavbar from '@/components/TopNavbar'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Flame, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface RecentSubmission {
  id: string
  title: string
  titleSlug: string
  timestamp: string
}

interface TopicStat {
  difficulty_level: string
  problems_solved: number
  tag_name: string
  user_id: string
}

interface LanguageStat {
  user_id: string
  language_name: string
  problems_solved: number
}

interface UserDetails {
  problem_stats?: {
    total_solved?: number
    easy_solved?: number
    medium_solved?: number
    hard_solved?: number
  }
  progress_stats?: {
    streak_count?: number
    total_active_days?: number
    recent_submissions?: string | RecentSubmission[]
    submission_calendar_json?: string
  }
  topic_stats?: TopicStat[]
  language_stats?: LanguageStat[]
}

const Dashboard = () => {
  const { user} = useAuth()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const SLIDE_COUNT = 4

  // Format user details as a chatbot prompt
  const formattedPrompt = useMemo(() => {
    if (!userDetails) return ''

    const prompt = `I am a LeetCode user with the following coding statistics and profile:

**Problem Solving Statistics:**
- Total Problems Solved: ${userDetails?.problem_stats?.total_solved || 0}
- Easy Problems: ${userDetails?.problem_stats?.easy_solved || 0}
- Medium Problems: ${userDetails?.problem_stats?.medium_solved || 0}
- Hard Problems: ${userDetails?.problem_stats?.hard_solved || 0}

**Activity & Consistency:**
- Current Streak: ${userDetails?.progress_stats?.streak_count || 0} days
- Total Active Days: ${userDetails?.progress_stats?.total_active_days || 0} days

**Programming Languages:**
${(() => {
        try {
          const langStats = Array.isArray(userDetails?.language_stats)
            ? (userDetails.language_stats as LanguageStat[])
            : []
          if (langStats.length === 0) return '- No language statistics available'
          return langStats
            .sort((a: LanguageStat, b: LanguageStat) => (b.problems_solved || 0) - (a.problems_solved || 0))
            .slice(0, 5)
            .map((lang: LanguageStat) => `- ${lang.language_name}: ${lang.problems_solved} problems solved`)
            .join('\n')
        } catch {
          return '- No language statistics available'
        }
      })()}

**Topic Expertise:**
${(() => {
        try {
          const topicStats = Array.isArray(userDetails?.topic_stats)
            ? (userDetails.topic_stats as TopicStat[])
            : []
          if (topicStats.length === 0) return '- No topic statistics available'
          const topTopics = topicStats
            .sort((a: TopicStat, b: TopicStat) => (b.problems_solved || 0) - (a.problems_solved || 0))
            .slice(0, 10)
            .map((topic: TopicStat) => `- ${topic.tag_name} (${topic.difficulty_level}): ${topic.problems_solved} problems`)
            .join('\n')
          return topTopics
        } catch {
          return '- No topic statistics available'
        }
      })()}

**Recent Activity:**
${(() => {
        try {
          const recentSubs = typeof userDetails?.progress_stats?.recent_submissions === 'string'
            ? (JSON.parse(userDetails.progress_stats.recent_submissions) as RecentSubmission[])
            : (userDetails?.progress_stats?.recent_submissions as RecentSubmission[]) || []
          if (!Array.isArray(recentSubs) || recentSubs.length === 0) {
            return '- No recent submissions'
          }
          return recentSubs
            .slice(0, 5)
            .map((sub: RecentSubmission) => `- ${sub.title || 'Unknown'}`)
            .join('\n')
        } catch {
          return '- No recent submissions available'
        }
      })()}

Based on this profile, please provide personalized coding practice recommendations, problem suggestions, and learning path guidance.`

    return prompt
  }, [userDetails])

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(formattedPrompt)
      toast.success('Prompt copied to clipboard!')
    } catch {
      toast.error('Failed to copy prompt')
    }
  }

  // Track active slide in the horizontal stats section
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const center = container.scrollLeft + container.clientWidth / 2
      const distances = cardRefs.current.map((card) => {
        if (!card) return Number.MAX_VALUE
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        return Math.abs(cardCenter - center)
      })
      const nearestIndex = distances.indexOf(Math.min(...distances))
      if (nearestIndex !== -1 && nearestIndex !== activeSlide) {
        setActiveSlide(nearestIndex)
      }
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [activeSlide])


  // Parse recent submissions from JSON string
  const recentSubmissions = useMemo<RecentSubmission[]>(() => {
    if (!userDetails?.progress_stats?.recent_submissions) return []
    
    try {
      const jsonStr = typeof userDetails.progress_stats.recent_submissions === 'string' 
        ? userDetails.progress_stats.recent_submissions 
        : JSON.stringify(userDetails.progress_stats.recent_submissions)
      
      const parsed = JSON.parse(jsonStr)
      return Array.isArray(parsed) ? parsed : []
    } catch (err) {
      // debug-level log parsing problems; tests intentionally exercise malformed JSON
      const msg = err instanceof Error ? err.message : String(err)
      console.debug('Error parsing recent submissions:', msg)
      return []
    }
  }, [userDetails])

  // Parse topic stats
  const topicStats = useMemo<TopicStat[]>(() => {
    if (!userDetails?.topic_stats) return []
    
    try {
      const stats = Array.isArray(userDetails.topic_stats) 
        ? userDetails.topic_stats 
        : []
      
      // Sort by problems_solved descending
      return [...stats].sort((a, b) => (b.problems_solved || 0) - (a.problems_solved || 0))
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.debug('Error parsing topic stats:', msg)
      return []
    }
  }, [userDetails])

  // Parse language stats
  const languageStats = useMemo<LanguageStat[]>(() => {
    if (!userDetails?.language_stats) return []
    
    try {
      const stats = Array.isArray(userDetails.language_stats) 
        ? userDetails.language_stats 
        : []
      
      // Sort by problems_solved descending
      return [...stats].sort((a, b) => (b.problems_solved || 0) - (a.problems_solved || 0))
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.debug('Error parsing language stats:', msg)
      return []
    }
  }, [userDetails])

  // Get difficulty level color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fundamental':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
      case 'advanced':
        return 'bg-red-500/10 text-red-600 dark:text-red-400'
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
    }
  }

  // Format difficulty level
  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
  }

  // Format timestamp to human-readable format
  const formatTimeAgo = (timestamp: string): string => {
    try {
      const timestampNum = parseInt(timestamp, 10)
      if (isNaN(timestampNum)) return 'Unknown'
      
      const now = Math.floor(Date.now() / 1000)
      const diff = now - timestampNum
      
      if (diff < 60) return 'Just now'
      if (diff < 3600) {
        const minutes = Math.floor(diff / 60)
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
      }
      if (diff < 86400) {
        const hours = Math.floor(diff / 3600)
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
      }
      if (diff < 604800) {
        const days = Math.floor(diff / 86400)
        return `${days} day${days !== 1 ? 's' : ''} ago`
      }
      if (diff < 2592000) {
        const weeks = Math.floor(diff / 604800)
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
      }
      if (diff < 31536000) {
        const months = Math.floor(diff / 2592000)
        return `${months} month${months !== 1 ? 's' : ''} ago`
      }
      const years = Math.floor(diff / 31536000)
      return `${years} year${years !== 1 ? 's' : ''} ago`
    } catch {
      return 'Unknown'
    }
  }
  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data, error } = await supabase.rpc('get_user_details', {
        p_user_id: user?.id
      })
      if (error){
        toast.error(error.message)
      } else {
  toast.success("User details fetched successfully")
  console.debug("user details", data)
        setUserDetails(data)
      }
    }
    if (user?.id) {
      fetchUserDetails()
    }
  }, [user])

  return (
    <>
      <TopNavbar />
      <div className="w-full space-y-6 px-4 md:px-6 pt-4 md:pt-6 pb-24 sm:pb-6 bg-background">
        {/* Header */}
        {/* Flexbox 1: Stats Cards - Total Solved, Easy, Medium, Hard */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex flex-2 flex-row gap-4 w-full">
            <Card className="flex-1">
              <CardHeader>
                <CardDescription>Total Solved</CardDescription>
                <CardTitle className="text-2xl">{userDetails?.problem_stats?.total_solved}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardDescription>Easy Problems Solved</CardDescription>
                <CardTitle className="text-2xl">{userDetails?.problem_stats?.easy_solved}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="flex flex-2 flex-row gap-4 w-full">
            <Card className="flex-1">
              <CardHeader>
                <CardDescription>Medium Problems Solved</CardDescription>
                <CardTitle className="text-2xl">{userDetails?.problem_stats?.medium_solved}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardDescription>Hard Problems Solved</CardDescription>
                <CardTitle className="text-2xl">{userDetails?.problem_stats?.hard_solved}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="flex flex-1 flex-row gap-4 w-full">
          <Card className="flex-1 min-h-[100px] p-0 overflow-hidden flex">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  className="w-full h-full rounded-none border-0 flex-1 text-xl" 
                  variant="default"
                  size="lg"
                >
                  Get Custom Prompt
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] sm:max-w-xl overflow-y-auto"
              >
                <div className="space-y-4 p-2 sm:p-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Custom Chatbot Prompt</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPrompt}
                      className="h-8 w-8 p-0"
                      disabled={!formattedPrompt}
                      aria-label="Copy prompt"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {formattedPrompt ? (
                    <div className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg border">
                      {formattedPrompt}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Loading user details...
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Tap the copy button to use this prompt with any AI chatbot for personalized coding recommendations.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </Card>
          </div>
        </div>

        {/* Flexbox 2: Chart Section */}
        <div className="flex w-full">
          <Card className="flex-1 w-full">
            <CardHeader>
              <CardTitle>Solving Progress</CardTitle>
              <CardDescription>Monthly problem solving statistics</CardDescription>
            </CardHeader>
            <div className="pl-4 pr-4 sm:pl-0 sm:pr-0">
              <CardContent className="pl-2 overflow-x-scroll sm:overflow-x-hidden">
                <ExampleChart submissionCalendar={userDetails?.progress_stats?.submission_calendar_json} />
              </CardContent>
            </div>
          </Card>
        </div>
        <div
          ref={scrollContainerRef}
          className="flex flex-row gap-4 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:scroll-auto"
        >
          {/* Flexbox 3: Streak Stats and Language Stats */}
          <Card
            ref={(el) => {
              cardRefs.current[0] = el
            }}
            className="w-full flex flex-col min-w-[calc(100vw-2rem)] sm:min-w-0 flex-shrink-0 snap-center"
          >
              <CardHeader>
                <CardTitle>Streak Stats</CardTitle>
                <CardDescription>Your streak statistics</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-6">
                <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br from-[var(--primary)]/20 to-[var(--chart-3)]/20 dark:from-[var(--primary)]/20 dark:to-[var(--chart-3)]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="h-6 w-6 text-primary" />
                    <CardDescription className="text-sm font-medium text-foreground mb-0">
                      Max Streak
                    </CardDescription>
                  </div>
                  <CardTitle className="text-4xl font-bold text-primary">
                    {userDetails?.progress_stats?.streak_count ?? 0}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">highest streak you have had</p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br from-[var(--chart-2)]/20 to-[var(--chart-1)]/20 dark:from-[var(--chart-2)]/20 dark:to-[var(--chart-1)]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-6 w-6 text-[var(--chart-2)]" />
                    <CardDescription className="text-sm font-medium text-foreground mb-0">
                      Total Active Days
                    </CardDescription>
                  </div>
                  <CardTitle className="text-4xl font-bold text-[var(--chart-2)]">
                    {userDetails?.progress_stats?.total_active_days ?? 0}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">days of coding</p>
                </div>
              </CardContent>
          </Card>

          <Card
            ref={(el) => {
              cardRefs.current[1] = el
            }}
            className="w-full flex flex-col min-w-[calc(100vw-2rem)] sm:min-w-0 flex-shrink-0 snap-center"
          >
              <CardHeader>
                <CardTitle>Language Stats</CardTitle>
                <CardDescription>Problems solved by programming language</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
                {languageStats.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No language stats found</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-2">
                    {languageStats.map((lang, index) => (
                      <div 
                        key={`${lang.language_name}-${index}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {lang.language_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-foreground">
                            {lang.problems_solved}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            solved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
          </Card>
            {/* Flexbox 4: Recent Submissions and Topic Stats */}
          <Card
            ref={(el) => {
              cardRefs.current[2] = el
            }}
            className="w-full flex flex-col min-w-[calc(100vw-2rem)] sm:min-w-0 flex-shrink-0 snap-center"
          >
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Your latest solved problems</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
                {recentSubmissions.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No recent submissions found or they might be private for your profile</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-2">
                    {recentSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex size-8 sm:size-9 items-center justify-center rounded-full font-semibold text-xs sm:text-sm shrink-0 bg-green-500/10 text-green-600 dark:text-green-400">
                          ✓
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm py-1 font-medium leading-tight">
                            {submission.title}
                          </p>
                          <a
                            href={`https://leetcode.com/problems/${submission.titleSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate block"
                          >
                            View on LeetCode →
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">
                          {formatTimeAgo(submission.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
          </Card>

          <Card
            ref={(el) => {
              cardRefs.current[3] = el
            }}
            className="w-full flex flex-col min-w-[calc(100vw-2rem)] sm:min-w-0 flex-shrink-0 snap-center"
          >
              <CardHeader>
                <CardTitle>Topic Stats</CardTitle>
                <CardDescription>Your topic-wise problem solving statistics</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
                {topicStats.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No topic stats found</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-2">
                    {topicStats.map((topic, index) => (
                      <div
                        key={`${topic.tag_name}-${topic.difficulty_level}-${index}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">
                              {topic.tag_name}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getDifficultyColor(topic.difficulty_level)}`}>
                              {formatDifficulty(topic.difficulty_level)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-foreground">
                            {topic.problems_solved}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            solved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
          </Card>
        </div>
        <div className="flex justify-center gap-2 mb-2 sm:hidden">
          {Array.from({ length: SLIDE_COUNT }).map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full transition-colors ${activeSlide === idx ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Dashboard