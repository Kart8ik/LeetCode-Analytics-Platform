import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const menuItems = [
    { icon: '', label: 'Dashboard', active: true },
    { icon: '', label: 'Problems', active: false },
    { icon: '', label: 'Progress', active: false },
    { icon: '', label: 'Achievements', active: false },
    { icon: '', label: 'Notes', active: false },
    { icon: '', label: 'Settings', active: false },
  ]

  return (
    <div 
      className={`flex flex-col h-screen bg-card border-r sticky top-0 transition-all duration-300 ${
        isOpen ? 'w-56' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          LeetTracker
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Track your progress</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item, i) => (
          <Button
            key={i}
            variant={item.active ? 'default' : 'ghost'}
            className="w-full justify-start text-sm"
            size="sm"
          >
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t">
        <Button
          variant="outline"
          className="w-full justify-start text-sm"
          size="sm"
          onClick={toggleTheme}
        >
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
      </div>

      {/* User Section */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
            LC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Coder123</p>
            <p className="text-[10px] text-muted-foreground truncate">Easy: 45 | Med: 23</p>
          </div>
        </div>
      </div>
    </div>
  )
}


