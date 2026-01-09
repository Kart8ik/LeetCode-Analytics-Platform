import { useEffect, useMemo, useRef, useState } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/responsive-tooltip"

type CalendarDay = { date: Date }

const INACTIVE_COLOR = "bg-[#ebedf0] dark:bg-[#161b22]"
const ACTIVE_COLORS = ["bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"]

const LoadingPage = () => {
    const calendarRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<number | null>(null)

    // Build a last-year calendar grid aligned by weeks (Sunday start)
    const calendarGrid = useMemo(() => {
        const today = new Date()
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
        const oneYearAgo = new Date(todayUTC)
        oneYearAgo.setUTCFullYear(todayUTC.getUTCFullYear() - 1)

        const startDate = new Date(oneYearAgo)
        const dayOfWeek = startDate.getUTCDay()
        startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek)
        startDate.setUTCHours(0, 0, 0, 0)

        const grid: Array<Array<CalendarDay>> = []
        const currentDate = new Date(startDate)
        const endDate = new Date(todayUTC)

        while (currentDate <= endDate) {
            const week: Array<CalendarDay> = []
            for (let day = 0; day < 7; day++) {
                const year = currentDate.getUTCFullYear()
                const month = currentDate.getUTCMonth()
                const dateNum = currentDate.getUTCDate()
                const date = new Date(Date.UTC(year, month, dateNum, 0, 0, 0, 0))
                week.push({ date })
                currentDate.setUTCDate(currentDate.getUTCDate() + 1)
            }
            grid.push(week)
        }

        return grid
    }, [])

    const totalColumns = useMemo(() => calendarGrid.length, [calendarGrid.length])
    const totalCells = useMemo(() => totalColumns * 7, [totalColumns])

    // Precompute random intensities so each cell keeps its shade after activation
    const randomIntensities = useMemo(() => {
        const shades: string[] = []
        for (let i = 0; i < totalCells; i++) {
            const shade = ACTIVE_COLORS[Math.floor(Math.random() * ACTIVE_COLORS.length)]
            shades.push(shade)
        }
        return shades
    }, [totalColumns])

    const [activeColumns, setActiveColumns] = useState(0)
    const targetDurationRef = useRef<number>(3500)

    // Single-pass left-to-right fill per column (~3-4s, slight jitter)
    useEffect(() => {
        if (totalColumns === 0) return

        setActiveColumns(0)
        targetDurationRef.current = 3000 + Math.floor(Math.random() * 1000) // 3-4s window
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current)
        }

        const startTime = performance.now()
        intervalRef.current = window.setInterval(() => {
            const elapsed = performance.now() - startTime
            const ratio = Math.min(1, elapsed / targetDurationRef.current)
            const nextColumns = Math.ceil(ratio * totalColumns)

            setActiveColumns((prev) => {
                if (nextColumns <= prev) return prev
                if (nextColumns >= totalColumns && intervalRef.current) {
                    window.clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                return nextColumns
            })
        }, 24)

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [totalColumns])

    const percentComplete = useMemo(() => {
        if (totalColumns === 0) return 0
        return Math.min(100, Math.round((activeColumns / totalColumns) * 100))
    }, [activeColumns, totalColumns])

    // Mobile shows zoomed-in view (~half visible), so scale percentage to match visible area
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const displayPercent = useMemo(() => {
        if (!isMobile) return percentComplete
        // On mobile, visible area is roughly 50% of total grid, so scale by ~1.8x
        return Math.min(100, Math.round(percentComplete * 1.8))
    }, [isMobile, percentComplete])

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const todayUTC = useMemo(() => {
        const today = new Date()
        return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    }, [])

    return (
        <div className="fixed inset-0 flex items-center justify-center px-2 sm:px-4 overflow-hidden">
            {/* Desktop layout */}
            <div className="hidden sm:flex relative w-full flex-col gap-2">

                {/* Calendar grid - desktop */}
                <div className="relative flex gap-1">
                    <TooltipProvider>
                        <div ref={calendarRef} className="flex flex-row gap-1 flex-1">
                            {calendarGrid.map((week, weekIdx) => (
                                <div key={weekIdx} className="flex flex-1 flex-col gap-1">
                                    {week.map((day, dayIdx) => {
                                        const cellIndex = weekIdx * 7 + dayIdx
                                        const isActive = weekIdx < activeColumns
                                        const isFuture = day.date > todayUTC
                                        const colorClass = isActive
                                            ? randomIntensities[cellIndex] ?? ACTIVE_COLORS[ACTIVE_COLORS.length - 1]
                                            : `${INACTIVE_COLOR} ${isFuture ? "opacity-30" : ""}`.trim()

                                        return (
                                            <Tooltip key={`${weekIdx}-${dayIdx}`}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`aspect-square w-full rounded-sm ${colorClass} cursor-pointer transition-all duration-150 ease-out`}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-sm">
                                                        <div className="font-medium">
                                                            {isActive ? "Locked In..." : "Waiting..."}
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

            {/* Mobile layout - zoomed in, showing ~half the calendar */}
            <div className="flex sm:hidden items-end justify-center w-full h-full overflow-hidden">
                <TooltipProvider>
                    <div className="flex flex-col-reverse gap-1">
                        {calendarGrid.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-row gap-1">
                                {week.map((day, dayIdx) => {
                                    const cellIndex = weekIdx * 7 + dayIdx
                                    const isActive = weekIdx < activeColumns
                                    const isFuture = day.date > todayUTC
                                    const colorClass = isActive
                                        ? randomIntensities[cellIndex] ?? ACTIVE_COLORS[ACTIVE_COLORS.length - 1]
                                        : `${INACTIVE_COLOR} ${isFuture ? "opacity-30" : ""}`.trim()

                                    return (
                                        <Tooltip key={`${weekIdx}-${dayIdx}`}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`w-6 h-6 rounded-sm ${colorClass} cursor-pointer transition-all duration-150 ease-out`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        {isActive ? "Locked In..." : "Waiting..."}
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

            <div className="absolute left-0 bottom-0 flex items-center justify-start pl-1 text-2xl sm:text-8xl font-black text-primary drop-shadow-sm">
                {displayPercent}%
            </div>
        </div>
    )

}
export default LoadingPage
