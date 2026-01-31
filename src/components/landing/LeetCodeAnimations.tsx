import { useEffect, useRef, useState } from 'react'
import { Code, Flame } from 'lucide-react'

type LeetCodeProblem = {
  id: string
  number: number
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  side: 'left' | 'right'
  delay: number
  position: 'top' | 'middle' | 'bottom'
}

const problems: LeetCodeProblem[] = [
  { id: '1', number: 1, name: 'Two Sum', difficulty: 'Easy', side: 'left', delay: 0, position: 'top' },
  { id: '20', number: 20, name: 'Valid Parentheses', difficulty: 'Easy', side: 'right', delay: 200, position: 'top' },
  { id: '3', number: 3, name: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', side: 'left', delay: 400, position: 'middle' },
  { id: '56', number: 56, name: 'Merge Intervals', difficulty: 'Medium', side: 'right', delay: 600, position: 'middle' },
  { id: '42', number: 42, name: 'Trapping Rain Water', difficulty: 'Hard', side: 'left', delay: 800, position: 'bottom' },
  { id: '4', number: 4, name: 'Median of Two Sorted Arrays', difficulty: 'Hard', side: 'right', delay: 1000, position: 'bottom' },
]

const stats = {
  streak: 15,
  easy: 45,
  medium: 81,
  hard: 15,
}

export default function LeetCodeAnimations() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [animatedComponents, setAnimatedComponents] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // On mobile, show fewer problems (first 4)
            const problemsToShow = isMobile ? problems.slice(0, 4) : problems
            
            problemsToShow.forEach((prob) => {
              setTimeout(() => {
                setAnimatedComponents((prev) => new Set(prev).add(prob.id))
              }, prob.delay)
            })
            // Animate stats after problems
            setTimeout(() => {
              setAnimatedComponents((prev) => new Set(prev).add('stats'))
            }, isMobile ? 1000 : 1200)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [isMobile])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'Hard':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getPositionClass = (position: string) => {
    if (isMobile) {
      // On mobile, space them more vertically
      switch (position) {
        case 'top':
          return 'top-[15%]'
        case 'middle':
          return 'top-[50%]'
        case 'bottom':
          return 'top-[85%]'
        default:
          return 'top-1/2'
      }
    }
    // Desktop positions
    switch (position) {
      case 'top':
        return 'top-[10%]'
      case 'middle':
        return 'top-[45%]'
      case 'bottom':
        return 'top-[80%]'
      default:
        return 'top-1/2'
    }
  }

  const renderProblem = (prob: LeetCodeProblem) => {
    const isAnimated = animatedComponents.has(prob.id)
    const translateX = prob.side === 'left' ? '-100%' : '100%'

    return (
      <div
        key={prob.id}
        className={`absolute ${prob.side === 'left' ? 'left-2 md:left-8' : 'right-2 md:right-8'} ${getPositionClass(prob.position)} transition-all duration-700 ease-out`}
        style={{
          transform: isAnimated ? 'translateX(0)' : `translateX(${translateX})`,
          opacity: isAnimated ? 1 : 0,
        }}
      >
        <div className={`bg-card border border-border rounded-lg p-2 md:p-3 shadow-lg ${isMobile ? 'max-w-[140px]' : 'max-w-[220px] md:max-w-[280px]'}`}>
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Code className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-mono text-muted-foreground`}>#{prob.number}</div>
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-foreground truncate leading-tight`}>{prob.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} rounded font-medium ${getDifficultyColor(prob.difficulty)}`}>
              {prob.difficulty}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const isStatsAnimated = animatedComponents.has('stats')
  const statsTranslateY = '-100%'
  const problemsToShow = isMobile ? problems.slice(0, 4) : problems

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {problemsToShow.map(renderProblem)}
      
      {/* Stats Badge */}
      <div
        className="absolute left-1/2 top-[5%] -translate-x-1/2 transition-all duration-700 ease-out"
        style={{
          transform: isStatsAnimated 
            ? 'translate(-50%, 0)' 
            : `translate(-50%, ${statsTranslateY})`,
          opacity: isStatsAnimated ? 1 : 0,
        }}
      >
        <div className={`bg-card border border-border rounded-full ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} shadow-lg flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-wrap justify-center`}>
          <div className="flex items-center gap-1 md:gap-1.5">
            <Flame className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-orange-500`} />
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-foreground`}>streak {stats.streak}</span>
          </div>
          <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'} ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
            <span className="text-green-600 dark:text-green-400 font-medium">easy {stats.easy}</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">mediums {stats.medium}</span>
            <span className="text-red-600 dark:text-red-400 font-medium">hard {stats.hard}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
