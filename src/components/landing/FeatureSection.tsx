import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type FeatureSectionProps = {
  image: string
  title: string
  description: string
  imagePosition: 'left' | 'right'
}

export default function FeatureSection({
  image,
  title,
  description,
  imagePosition,
}: FeatureSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-16 md:py-24 px-4 md:px-6',
        'transition-all duration-1000 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      )}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={cn(
            'flex flex-col gap-8 md:gap-12',
            // On desktop: image left = flex-row, image right = flex-row-reverse
            // On mobile: always flex-col (image on top, text below)
            imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
          )}
        >
          {/* Image */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className={cn(
                'w-full max-w-md aspect-video bg-muted border border-border rounded-lg flex items-center justify-center',
                'transition-transform duration-700 ease-out',
                isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              )}
            >
              <div className="text-center p-8">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {image}
                </div>
                <div className="text-xs text-muted-foreground/70">
                  Placeholder Image
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
