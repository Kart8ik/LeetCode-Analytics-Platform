import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Dashboard from '@/pages/Dashboard'
import Leaderboard from '@/pages/Leaderboard'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import AuthCallback from '@/pages/AuthCallback'
import SetupProfile from '@/pages/SetupProfile'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataCacheProvider } from '@/context/DataCacheContext'
import { Toaster } from '@/components/ui/sonner'
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingPage from '@/pages/Loading'
import { ConfirmProvider } from '@/context/ConfirmContext'
import { supabase } from '@/lib/supabase'

function ProtectedRoute() {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session || !user) {
      return;
    }

    let active = true;

    const checkProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (!active) return;

      if (error || !data?.username) {
        navigate('/setup-profile', { replace: true });
        return;
      }
    };

    checkProfile();

    return () => {
      active = false;
    };
  }, [loading, navigate, session, user]);

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
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/setup-profile" element={<SetupProfile />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
  )
}

function ToasterWrapper() {
  const isMobile = useIsMobile();
  return <Toaster richColors position={isMobile ? 'top-right' : 'bottom-right'} duration={3000} />;
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
