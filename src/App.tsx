import './App.css'
import { Sidebar } from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
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
