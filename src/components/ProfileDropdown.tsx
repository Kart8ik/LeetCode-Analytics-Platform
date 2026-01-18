import { useMemo, useState, useCallback, useEffect } from 'react'
import { GraduationCap, LogOut, Menu, UserCircle2, Lock, Globe } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import ThemeToggle from '@/components/ThemeToggle'
import { Separator } from './ui/separator'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const ProfileDropdown = ({ handleLogout }: { handleLogout: () => void }) => {
  const { user } = useAuth()
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Load privacy state from public.users (the single source of truth)
  useEffect(() => {
    if (!user?.id) return

    let mounted = true

    const loadPrivacy = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('is_private')
        .eq('user_id', user.id)
        .single()

      if (!error && mounted && data) {
        setIsPrivate(data.is_private)
      }
    }

    loadPrivacy()

    return () => {
      mounted = false
    }
  }, [user?.id])

  const handlePrivacyToggle = useCallback(async () => {
    if (isToggling || isPrivate === null) return
    
    setIsToggling(true)
    
    try {
      const { data, error } = await supabase.rpc('toggle_privacy')
      
      if (error) {
        if (error.message.includes('rate limited')) {
          toast.warning('Slow down!', {
            description: 'Please wait a few seconds before toggling again.',
          })
        } else {
          console.error('Privacy toggle error:', error)
          toast.error('Failed to update', {
            description: 'Could not update your privacy setting.',
          })
        }
        return
      }
      
      // RPC return value is the single source of truth
      if (typeof data === 'boolean') {
        setIsPrivate(data)
        toast.success(data ? 'Profile set to private' : 'Profile set to public', {
          description: data 
            ? 'Your stats are now hidden from the leaderboard.' 
            : 'Your stats are now visible on the leaderboard.',
        })
      }
    } catch (err) {
      console.error('Privacy toggle error:', err)
      toast.error('Failed to update', {
        description: 'Could not update your privacy setting.',
      })
    } finally {
      setIsToggling(false)
    }
  }, [isToggling, isPrivate])


  const realName = useMemo(
    () => user?.user_metadata?.real_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Guest',
    [user],
  )
  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'anonymous'
  const section = user?.user_metadata?.section ?? '—'
  const semester = user?.user_metadata?.semester ?? '—'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border shadow-sm"
          aria-label="Open profile menu"
        >
          <Menu className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mr-4 rounded-xl border-border bg-popover p-0 shadow-lg">
        <div className="flex items-center justify-between gap-3 rounded-t-xl px-4 py-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">{realName}</span>
            <span className="text-xs text-muted-foreground">@{username}</span>
          </div>
           <div className="flex h-10 w-10 items-center justify-center bg-popover">
             <UserCircle2 className="h-8 w-8 text-muted-foreground stroke-[1]" aria-hidden="true" />
          </div>
        </div>

        <DropdownMenuSeparator />

          <div className="flex items-center gap-3 px-4 py-1">
            <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="flex items-center text-sm gap-2">
              <span className="font-medium text-foreground my-2">Section {section}</span>
              <Separator orientation="vertical" className="mx-2 h-8 w-0.5 bg-border/80 dark:bg-border/60" />
              <span className="font-medium text-foreground my-2">Semester {semester}</span>
            </div>
          </div>

        <DropdownMenuSeparator />

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between gap-3 px-4 py-1">
          <span className="text-sm font-medium text-foreground">
            {isPrivate === null ? 'Loading...' : isPrivate ? 'Private Profile' : 'Public Profile'}
          </span>
          <div className="rounded-full border border-border p-1">
            {isPrivate === null ? (
              <div className="h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={isPrivate}
                aria-label="Toggle profile privacy"
                disabled={isToggling}
                onClick={handlePrivacyToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handlePrivacyToggle()
                  }
                }}
                className={`relative inline-flex h-8 w-16 items-center justify-between px-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPrivate ? 'bg-[#FF6B35]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <Globe className={`h-4 w-4 ml-0.5 ${isPrivate ? 'text-orange-200' : 'text-green-600 dark:text-green-400'} z-10`} aria-hidden="true" />
                <span
                  className={`absolute inline-block h-6 w-6 left-1 transform rounded-full bg-white shadow transition-transform ${
                    isPrivate ? 'translate-x-8' : 'translate-x-0'
                  }`}
                />
                <Lock className={`h-4 w-4 mr-0.5 text-slate-500 z-10`} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-1">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-primary hover:text-primary"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Logout</span>
          </Button>
          <div className="rounded-full border border-border p-1">
            <ThemeToggle />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
