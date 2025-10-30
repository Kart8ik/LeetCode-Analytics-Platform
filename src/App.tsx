import './App.css'
import { AppSidebar } from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <SidebarTrigger />
        <Dashboard />
      </main>
    </SidebarProvider>
  )
}

export default App
