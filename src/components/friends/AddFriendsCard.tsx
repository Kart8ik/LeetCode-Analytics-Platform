import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FriendSearchInput from '@/components/friends/FriendSearchInput'

type Props = {
  onFriendRequestSent?: () => void
}

export default function AddFriendsCard({ onFriendRequestSent }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Add Friends</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Search users by username to send friend requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FriendSearchInput onRequestSent={onFriendRequestSent} />
      </CardContent>
    </Card>
  )
}
