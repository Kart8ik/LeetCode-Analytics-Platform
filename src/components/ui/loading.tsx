// lightweight loading spinner/overlay used across pages

type Size = 'sm' | 'md' | 'lg'

export function LoadingSpinner({ size = 'md', className = '' }: { size?: Size; className?: string }) {
  const sizes: Record<Size, string> = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={`inline-block ${className}`} role="status" aria-live="polite">
      <div className={`rounded-full animate-spin border-t-primary border-primary/20 border-solid ${sizes[size]} border-gray-200`} />
    </div>
  )
}

export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        {message && <div className="mt-3 text-sm text-muted-foreground">{message}</div>}
      </div>
    </div>
  )
}

export default LoadingSpinner
