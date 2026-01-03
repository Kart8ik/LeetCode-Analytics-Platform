import LogoLight from '@/assets/images/icons/logo-icon-whitebg1.png'
import LogoDark from '@/assets/images/icons/logo-icon-blackbg.png'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '@/context/AuthContext'

export default function LoginNavbar() {
  const { isDark } = useAuth()

  return (
    <header className="relative z-50 w-full border-b border-border bg-background shadow-sm">
      <div className="flex flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={isDark ? LogoLight : LogoDark} 
            alt="LeetTrack Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LeetTrack</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base hidden sm:block">
              Track your coding journey with your friends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}