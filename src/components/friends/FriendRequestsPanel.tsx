import { useState, useEffect } from 'react'
import { UserPlus, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useConfirm } from '@/context/ConfirmContext'

type FriendRequest = {
  user_id: string
  username: string
}

type FriendRequestsData = {
  incoming: FriendRequest[] | null
  outgoing: FriendRequest[] | null
}

type FriendRequestsPanelProps = {
  requests: FriendRequestsData
  isLoading: boolean
  onRefresh: () => void
}

export default function FriendRequestsPanel({
  requests,
  isLoading,
  onRefresh,
}: FriendRequestsPanelProps) {
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set())
  const [cancelingIds, setCancelingIds] = useState<Set<string>>(new Set())
  const confirm = useConfirm()
  // Local optimistic copy of outgoing requests so we can remove immediately
  const [localOutgoing, setLocalOutgoing] = useState<FriendRequest[]>(requests.outgoing ?? [])

  // Keep localOutgoing in sync when parent prop changes (e.g., after a refresh)
  useEffect(() => {
    setLocalOutgoing(requests.outgoing ?? [])
  }, [requests.outgoing])

  const handleAccept = async (fromUserId: string, username: string) => {
    if (acceptingIds.has(fromUserId)) return

    setAcceptingIds((prev) => new Set(prev).add(fromUserId))

    try {
      const { error } = await supabase.rpc('accept_friend_request', {
        p_from: fromUserId,
      })

      if (error) {
        toast.error('Failed to accept request', { description: error.message })
        return
      }

      toast.success(`You are now friends with @${username}`)
      onRefresh()
    } catch (err) {
      console.error('Failed to accept friend request:', err)
      toast.error('Failed to accept request')
    } finally {
      setAcceptingIds((prev) => {
        const next = new Set(prev)
        next.delete(fromUserId)
        return next
      })
    }
  }

  const handleCancel = async (friendId: string, username: string) => {
    if (cancelingIds.has(friendId)) return
    
    const confirmed = await confirm({
      title: 'Cancel Friend Request',
      description: `Are you sure you want to cancel the friend request to @${username}?`,
      confirmText: 'Cancel Request',
      cancelText: 'Keep Request',
    })
    if (!confirmed) return

    // Optimistically remove from local list and disable button
    setCancelingIds((prev) => new Set(prev).add(friendId))
    setLocalOutgoing((prev) => prev.filter((r) => r.user_id !== friendId))

    try {
      const { error } = await supabase.rpc('cancel_friend_request', {
        p_target: friendId,
      })

      if (error) {
        toast.error('Failed to cancel request', { description: error.message })
        // Revert optimistic removal by refreshing from server
        onRefresh()
        return
      }

      toast.success(`Cancelled friend request to @${username}`)
      // Trigger parent refresh so bell/badge stays in sync
      onRefresh()
    } catch (err) {
      console.error('Failed to cancel friend request:', err)
      toast.error('Failed to cancel request')
      // Fallback: resync
      onRefresh()
    } finally {
      setCancelingIds((prev) => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }

  const incoming = requests.incoming ?? []
  const outgoing = localOutgoing
  const hasIncoming = incoming.length > 0
  const hasOutgoing = outgoing.length > 0
  const isEmpty = !hasIncoming && !hasOutgoing

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Friend Requests</h3>
      </div>

      <Separator />

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <UserPlus className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <>
            {/* Incoming Requests */}
            {hasIncoming && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Incoming
                </p>
                {incoming.map((request) => (
                  <div
                    key={request.user_id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium truncate">
                      @{request.username}
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleAccept(request.user_id, request.username)}
                      disabled={acceptingIds.has(request.user_id)}
                    >
                      {acceptingIds.has(request.user_id) ? (
                        <Spinner className="h-3 w-3" />
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {hasIncoming && hasOutgoing && <Separator />}

            {/* Outgoing Requests */}
            {hasOutgoing && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Outgoing
                </p>
                {outgoing.map((request) => (
                  <div
                    key={request.user_id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium truncate">
                      @{request.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleCancel(request.user_id, request.username)}
                        disabled={cancelingIds.has(request.user_id)}
                      >
                        {cancelingIds.has(request.user_id) ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          'Cancel'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
