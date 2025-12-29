import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Leaderboard from '@/pages/Leaderboard'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function Layout() {
  return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
  )
}

export default function App() {
  const isMobile = useIsMobile();
  return (
    <BrowserRouter>
      <Toaster richColors position={isMobile ? 'top-right' : 'bottom-right'} duration={700} />
      <AuthProvider>
        <Layout/>
      </AuthProvider>
    </BrowserRouter>
  );
}
