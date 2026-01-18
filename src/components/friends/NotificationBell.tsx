import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import FriendRequestsPanel from '@/components/friends/FriendRequestsPanel'

type FriendRequest = {
  user_id: string
  username: string
}

type FriendRequestsData = {
  incoming: FriendRequest[] | null
  outgoing: FriendRequest[] | null
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [requests, setRequests] = useState<FriendRequestsData>({ incoming: null, outgoing: null })
  const [isLoading, setIsLoading] = useState(false)

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_friend_requests')
      if (error) {
        console.error('Failed to fetch friend requests:', error.message)
        return
      }
      setRequests(data || { incoming: null, outgoing: null })
    } catch (err) {
      console.error('Failed to fetch friend requests:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch requests on mount (so badge count shows immediately)
  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])


  const incomingCount = requests.incoming?.length ?? 0

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border shadow-sm"
          aria-label="Friend requests"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {incomingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {incomingCount > 9 ? '9+' : incomingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 mr-4 rounded-xl border-border bg-popover p-0 shadow-lg" 
      >
        <FriendRequestsPanel
          requests={requests}
          isLoading={isLoading}
          onRefresh={fetchRequests}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
