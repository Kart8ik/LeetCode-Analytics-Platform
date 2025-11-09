import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Dashboard from '@/Pages/Dashboard'
import Leaderboard from '@/Pages/Leaderboard'
import Login from '@/Pages/Login'
import SignUp from '@/Pages/SignUp'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from 'sonner'

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
  return (
    <BrowserRouter>
      <Toaster richColors position="bottom-right" />
      <AuthProvider>
        <Layout/>
      </AuthProvider>
    </BrowserRouter>
  );
}
