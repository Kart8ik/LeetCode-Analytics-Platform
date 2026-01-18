import { useState } from 'react'
import { UserPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useConfirm } from '@/context/ConfirmContext'

type SearchUser = {
  user_id: string
  username: string
}

type FriendSearchResultsProps = {
  results: SearchUser[]
  onRequestSent: () => void
}

export default function FriendSearchResults({
  results,
  onRequestSent,
}: FriendSearchResultsProps) {
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set())
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const confirm = useConfirm()
  const handleSendRequest = async (targetUserId: string, username: string) => {
    if (sendingIds.has(targetUserId) || sentIds.has(targetUserId)) return
    const confirmed = await confirm({
      title: 'Send Friend Request',
      description: `Are you sure you want to send a friend request to @${username}?`,
      confirmText: 'Send Request',
      cancelText: 'Cancel',
    })
    if (!confirmed) return
    setSendingIds((prev) => new Set(prev).add(targetUserId))

    try {
      const { data, error } = await supabase.rpc('send_friend_request', {
        p_target: targetUserId,
      })

      if (error) {
        toast.error('Failed to send request', { description: error.message })
        return
      }

      // data is 'pending' or 'accepted' (auto-accepted if reverse pending exists)
      if (data === 'accepted') {
        toast.success(`You are now friends with @${username}`)
      } else {
        toast.success(`Friend request sent to @${username}`)
      }

      setSentIds((prev) => new Set(prev).add(targetUserId))
      onRequestSent()
    } catch (err) {
      console.error('Failed to send friend request:', err)
      toast.error('Failed to send request')
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev)
        next.delete(targetUserId)
        return next
      })
    }
  }

  return (
    <div className="divide-y">
      {results.map((user) => {
        const isSending = sendingIds.has(user.user_id)
        const isSent = sentIds.has(user.user_id)

        return (
          <div
            key={user.user_id}
            className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-accent/50 transition-colors"
          >
            <span className="text-sm font-medium truncate">@{user.username}</span>
            <Button
              size="sm"
              variant={isSent ? 'secondary' : 'default'}
              className="h-8 px-3 text-xs shrink-0"
              onClick={() => handleSendRequest(user.user_id, user.username)}
              disabled={isSending || isSent}
            >
              {isSending ? (
                <Spinner className="h-3 w-3" />
              ) : isSent ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Sent
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Request
                </>
              )}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
