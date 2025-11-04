import { AppSidebar } from '@/components/Sidebar'
import Dashboard from '@/pages/Dashboard'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

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
