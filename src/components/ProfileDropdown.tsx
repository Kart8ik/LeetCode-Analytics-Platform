import { useState, useCallback, useEffect, useRef } from 'react'
import { LogOut, Menu, UserCircle2, Lock, Globe, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import ThemeToggle from '@/components/ThemeToggle'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import ProfileEditorPanel from '@/components/ProfileEditorPanel'

/** Select (and similar) portals render outside the popover DOM; ignore those for dismiss. */
function isFromRadixSelectPortals(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('[data-slot="select-content"]') ||
      target.closest('[data-radix-select-content]') ||
      target.closest('[data-radix-popper-content-wrapper]'),
  )
}

const ProfileDropdown = ({ handleLogout }: { handleLogout: () => void }) => {
  const { user } = useAuth()
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null)
  const [isToggling, setIsToggling] = useState(false)
  const [mainMenuOpen, setMainMenuOpen] = useState(false)
  const [profileEditorOpen, setProfileEditorOpen] = useState(false)
  const skipMainMenuCloseFocusRef = useRef(false)
  const [profileSummary, setProfileSummary] = useState<{
    username: string | null
    real_name: string | null
    is_private: boolean | null
  } | null>(null)

  useEffect(() => {
    if (!user?.id) return

    let mounted = true

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username, real_name, is_private')
        .eq('user_id', user.id)
        .single()

      if (!error && mounted && data) {
        setProfileSummary(data)
        setIsPrivate(data.is_private)
      }
    }

    loadProfile()

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
        setProfileSummary((current) =>
          current
            ? {
                ...current,
                is_private: data,
              }
            : current,
        )
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

  const realName = profileSummary?.real_name ?? user?.email ?? 'Guest'
  const username = profileSummary?.username ?? user?.email?.split('@')[0] ?? 'anonymous'

  return (
    <Popover open={profileEditorOpen} onOpenChange={setProfileEditorOpen} modal={false}>
      <DropdownMenu
        modal={false}
        open={mainMenuOpen}
        onOpenChange={(open) => {
          setMainMenuOpen(open)
          if (open) setProfileEditorOpen(false)
        }}
      >
        <PopoverAnchor asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border shadow-sm"
              aria-label="Open profile menu"
            >
              <Menu className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
        </PopoverAnchor>
        <DropdownMenuContent
          className="w-64 mr-4 rounded-xl border-border bg-popover p-0 shadow-lg"
          onCloseAutoFocus={(e) => {
            if (skipMainMenuCloseFocusRef.current) {
              e.preventDefault()
              skipMainMenuCloseFocusRef.current = false
            }
          }}
        >
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

        <DropdownMenuItem
          className="flex items-center justify-between px-4 py-3 text-primary focus:text-primary"
          onSelect={() => {
            skipMainMenuCloseFocusRef.current = true
            // Defer open until after the menu unmount + mouseup, or the popover treats the release as an outside click and closes.
            window.setTimeout(() => setProfileEditorOpen(true), 0)
          }}
        >
          <span>Go to Profile settings</span>
          <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </DropdownMenuItem>

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

      <PopoverContent
        hideArrow
        side="bottom"
        align="end"
        sideOffset={8}
        alignOffset={-8}
        className="z-[60] w-[min(calc(100vw-1rem),22rem)] max-h-[min(85vh,32rem)] overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover p-0 text-sm text-popover-foreground shadow-lg"
        onPointerDownOutside={(event) => {
          const raw =
            event.detail && typeof event.detail === 'object' && 'originalEvent' in event.detail
              ? (event.detail as { originalEvent: PointerEvent }).originalEvent.target
              : (event as unknown as { target?: EventTarget }).target
          if (isFromRadixSelectPortals(raw ?? null)) {
            event.preventDefault()
          }
        }}
        onFocusOutside={(event) => {
          const raw =
            event.detail && typeof event.detail === 'object' && 'originalEvent' in event.detail
              ? (event.detail as { originalEvent: FocusEvent }).originalEvent.relatedTarget
              : null
          if (isFromRadixSelectPortals(raw)) {
            event.preventDefault()
          }
        }}
      >
        <ProfileEditorPanel
          presentation="dropdown"
          mode="edit"
          title="Profile settings"
          description="Update your profile details."
          submitLabel="Save changes"
          showEmail
        />
      </PopoverContent>
    </Popover>
  )
}

export default ProfileDropdown
