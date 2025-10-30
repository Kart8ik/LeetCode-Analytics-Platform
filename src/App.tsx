import './App.css'
import { Sidebar } from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Close sidebar on mobile by default
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="flex-1 overflow-auto relative">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 shrink-0"
        >
          ☰
        </Button>
        <Dashboard />
      </main>
    </div>
  )
}

export default App
