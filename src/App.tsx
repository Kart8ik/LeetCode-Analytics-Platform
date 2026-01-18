import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Leaderboard from '@/pages/Leaderboard'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataCacheProvider } from '@/context/DataCacheContext'
import { Toaster } from '@/components/ui/sonner'
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingPage from '@/pages/Loading'
import { ConfirmProvider } from '@/context/ConfirmContext'

function ProtectedRoute() {
  const { user, loading, session } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || !session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function Layout() {
  return (
        <Routes>
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
  )
}

function ToasterWrapper() {
  const isMobile = useIsMobile();
  return <Toaster richColors position={isMobile ? 'top-right' : 'bottom-right'} duration={700} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ConfirmProvider>
        <DataCacheProvider>
          <AuthProvider>
            <ToasterWrapper />
            <Layout/>
          </AuthProvider>
        </DataCacheProvider>
      </ConfirmProvider>
    </BrowserRouter>
  );
}
