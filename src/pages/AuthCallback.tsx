import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import LoadingPage from '@/pages/Loading'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [hasResolved, setHasResolved] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setHasResolved(true)
        return
      }

      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('user_id', session.user.id)
        .single();

      if (!data?.username) {
        navigate('/setup-profile', { replace: true });
      } else {
        navigate('/leaderboard', { replace: true });
      }

      setHasSession(true)
      setHasResolved(true)
    };

    handleAuth();
  }, [navigate])

  if (!hasResolved) {
    return <LoadingPage />
  }

  if (!hasSession) {
    return <Navigate to="/login" replace />
  }

  return <LoadingPage />
}