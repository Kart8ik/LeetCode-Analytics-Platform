import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import LeetCodeAnimations from './LeetCodeAnimations'

export default function HeroSection() {
  const { user } = useAuth()
  const isLoggedIn = !!user

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 md:py-32 overflow-hidden">
      <LeetCodeAnimations />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
          DSA with friends feels better than DSA alone
        </h1>
        
        <div className="flex justify-center">
          {isLoggedIn ? (
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/signup">Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
