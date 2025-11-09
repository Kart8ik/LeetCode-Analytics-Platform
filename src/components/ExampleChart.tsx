import { useMemo, useRef } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SubmissionCalendarProps {
  submissionCalendar?: string | null
}

export function ExampleChart({ submissionCalendar }: SubmissionCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null)

  // Parse submission calendar data
  const calendarData = useMemo(() => {
    if (!submissionCalendar) return new Map<string, number>()

    try {
      // Handle double-escaped JSON string
      let jsonStr = submissionCalendar
      if (typeof jsonStr === 'string') {
        // Remove outer quotes if present
        if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
          jsonStr = jsonStr.slice(1, -1)
        }
        // Unescape the string
        jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        console.log("jsonStr", jsonStr)
      }
      
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
      
      // Convert to Map with string keys (timestamps)
      // LeetCode returns timestamps as string keys in JSON
      const dataMap = new Map<string, number>()
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([key, value]) => {
          // Normalize key to string (in case it comes as number)
          const normalizedKey = String(key)
          const count = typeof value === 'number' ? value : parseInt(String(value), 10) || 0
          dataMap.set(normalizedKey, count)
        })
      }
      console.log("dataMap in calendarData", dataMap)
      console.log("First 5 entries:", Array.from(dataMap.entries()).slice(0, 5))
      return dataMap
    } catch (error) {
      console.error('Error parsing submission calendar:', error)
      return new Map<string, number>()
    }
  }, [submissionCalendar])

  // Generate calendar grid for the last year
  const calendarGrid = useMemo(() => {
    const today = new Date()
    // Use UTC to match LeetCode's timestamp format
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const oneYearAgo = new Date(todayUTC)
    oneYearAgo.setUTCFullYear(todayUTC.getUTCFullYear() - 1)
    
    // Start from the first day of the week that contains oneYearAgo
    const startDate = new Date(oneYearAgo)
    const dayOfWeek = startDate.getUTCDay()
    startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek) // Start from Sunday
    startDate.setUTCHours(0, 0, 0, 0)
    
    const grid: Array<Array<{ date: Date; count: number; timestamp: string }>> = []
    const currentDate = new Date(startDate)
    const endDate = new Date(todayUTC)
    
    // Create weeks (rows) - each week is a row
    while (currentDate <= endDate) {
      const week: Array<{ date: Date; count: number; timestamp: string }> = []
      
      // Create days in week (columns) - Sunday to Saturday
      for (let day = 0; day < 7; day++) {
        // Create date at UTC midnight for this day
        const year = currentDate.getUTCFullYear()
        const month = currentDate.getUTCMonth()
        const dateNum = currentDate.getUTCDate()
        const date = new Date(Date.UTC(year, month, dateNum, 0, 0, 0, 0))
        
        // Generate UTC timestamp in seconds (LeetCode format)
        const timestamp = Math.floor(date.getTime() / 1000).toString()
        
        // Try multiple timestamp formats to match LeetCode data
        let count = calendarData.get(timestamp) || 0
        
        // If not found, try without the string conversion
        if (count === 0 && calendarData.size > 0) {
          // Try looking up with the numeric value as string
          const numTimestamp = parseInt(timestamp, 10)
          count = calendarData.get(String(numTimestamp)) || 0
        }
        
        // Debug: log first few lookups to see what's happening
        if (grid.length === 0 && day < 3 && calendarData.size > 0) {
          console.log(`Date: ${date.toISOString()}, Looking for timestamp: ${timestamp}, found: ${count}`)
          const sampleKeys = Array.from(calendarData.keys()).slice(0, 5)
          console.log(`Sample keys in data:`, sampleKeys)
          // Try to find a matching timestamp near our target
          const targetNum = parseInt(timestamp, 10)
          const nearbyKey = sampleKeys.find(key => {
            const keyNum = parseInt(String(key), 10)
            return Math.abs(keyNum - targetNum) < 86400 // within 1 day
          })
          if (nearbyKey) {
            console.log(`Found nearby key: ${nearbyKey}, value: ${calendarData.get(String(nearbyKey))}`)
          }
        }
        
        week.push({ date, count, timestamp })
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }
      
      grid.push(week)
    }
    
    return grid
  }, [calendarData])

  // Get color intensity based on submission count using primary color
  const getColorIntensity = (count: number, maxCount: number): string => {
    if (count === 0) return 'bg-[#ebedf0] dark:bg-[#161b22]'
    
    // Use primary color with varying opacity based on intensity
    // Map to 4 intensity levels
    const intensity = maxCount > 0 ? count / maxCount : 0
    
    if (intensity >= 0.75) return 'bg-primary' // Full primary color for highest intensity
    if (intensity >= 0.5) return 'bg-primary/80'   // 80% opacity
    if (intensity >= 0.25) return 'bg-primary/60' // 60% opacity
    return 'bg-primary/40' // 40% opacity for lowest intensity
  }

  // Find max count for color scaling
  const maxCount = useMemo(() => {
    let max = 0
    calendarData.forEach((count) => {
      if (count > max) max = count
    })
    return max
  }, [calendarData])

  // Format date for tooltip
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Get month labels and positions
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = []
    const seenMonths = new Set<string>()
    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    
    calendarGrid.forEach((week, weekIdx) => {
      // Check the first day of the week (Sunday)
      const firstDay = week[0]
      if (firstDay && firstDay.date <= todayUTC) {
        const monthKey = `${firstDay.date.getUTCFullYear()}-${firstDay.date.getUTCMonth()}`
        // Only add if it's the first week of the month or we haven't seen this month
        if (!seenMonths.has(monthKey) || firstDay.date.getUTCDate() <= 7) {
          if (!seenMonths.has(monthKey)) {
            const monthLabel = firstDay.date.toLocaleDateString('en-US', { month: 'short' })
            labels.push({ month: monthLabel, weekIndex: weekIdx })
            seenMonths.add(monthKey)
          }
        }
      }
    })
    
    return labels
  }, [calendarGrid])

  // Create month label array aligned with calendar weeks
  const monthLabelArray = useMemo(() => {
    const labels: Array<string | null> = new Array(calendarGrid.length).fill(null)
    monthLabels.forEach((label) => {
      if (label.weekIndex < labels.length) {
        labels[label.weekIndex] = label.month
      }
    })
    return labels
  }, [calendarGrid.length, monthLabels])

  return (
    <div className="flex flex-col gap-2 w-full">
          {/* Month labels row */}
          <div className="flex w-full gap-1 pl-4">
            
            {/* Month labels aligned with calendar weeks */}
            <div className="flex flex-row gap-1 flex-1">
              {monthLabelArray.map((month, weekIdx) => (
                <div key={weekIdx} className="flex-1 flex items-start">
                  {month && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {month}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="relative flex w-full gap-1 pl-4">

            {/* Calendar squares - weeks as columns */}
            <TooltipProvider>
              <div 
                ref={calendarRef}
                className="flex flex-row gap-1 flex-1"
              >
                {calendarGrid.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1 flex-1">
                    {week.map((day, dayIdx) => {
                      const today = new Date()
                      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
                      const isFuture = day.date > todayUTC
                      const colorClass = isFuture 
                        ? 'bg-[#ebedf0] dark:bg-[#161b22] opacity-30' 
                        : getColorIntensity(day.count, maxCount)
                      
                      return (
                        <Tooltip key={`${weekIdx}-${dayIdx}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-full aspect-square rounded-sm ${colorClass} cursor-pointer hover:ring-2 hover:ring-ring transition-all`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">
                                {day.count} {day.count === 1 ? 'submission' : 'submissions'}
                              </div>
                              <div className="text-xs text-primary-foreground">
                                {formatDate(day.date)}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
    </div>
  )
}
