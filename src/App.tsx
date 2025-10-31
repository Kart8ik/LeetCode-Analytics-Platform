import './App.css'
import { AppSidebar } from '@/components/Pages/Sidebar/Sidebar'
import Dashboard from '@/components/Pages/Dashboard/Dashboard'
import { SidebarProvider, SidebarTrigger } from '@/components/Pages/ui/sidebar'

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
