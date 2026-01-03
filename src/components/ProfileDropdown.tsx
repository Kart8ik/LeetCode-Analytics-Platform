import { useMemo } from 'react'
import { GraduationCap, LogOut, Menu, UserCircle2 } from 'lucide-react'
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

const ProfileDropdown = ({ handleLogout }: { handleLogout: () => void }) => {
  const { user } = useAuth()

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
