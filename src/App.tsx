import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppSidebar } from '@/components/Sidebar'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from 'sonner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <AppSidebar />
                  <main className="flex-1 w-full">
                    <SidebarTrigger />
                    <Dashboard />
                  </main>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="bottom-right" />
      <AuthProvider>
        <Layout/>
      </AuthProvider>
    </BrowserRouter>
  );
}