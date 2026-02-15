import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { IoPersonAdd, IoCheckmark, IoCloseCircle, IoArrowBack, IoClose } from 'react-icons/io5'
import { getAvatarUrl } from '../../utils/avatarGenerator'
import { User } from '../../types'
import './Friends.css'

interface Friend {
  id: number
  status: 'pending' | 'accepted'
  friend_user_id: number
  friend_username: string
  friend_avatar: string | null
  friend_last_active: string | null
  request_direction: 'incoming' | 'outgoing'
}

interface FriendsProps {
  user: User
  t: any
  onClose: () => void
  cachedData?: Friend[]
}

const FriendItem = memo(({ 
  friend, 
  isOnline,
  onRemove
}: {
  friend: Friend
  isOnline: boolean
  onRemove: () => void
}) => (
  <div className="friend-item">
    <div className="friend-avatar-wrapper">
      <img 
        src={getAvatarUrl(friend.friend_avatar)} 
        alt={friend.friend_username}
        className="friend-avatar"
        loading="lazy"
      />
      <span className={`online-dot ${isOnline ? 'online' : ''}`} />
    </div>
    <div className="friend-info">
      <span className="friend-name">{friend.friend_username}</span>
      <span className={`friend-status ${isOnline ? 'online' : ''}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
    <button className="friend-remove-btn" onClick={onRemove} title="Remove">
      <IoClose size={16} />
    </button>
  </div>
))

FriendItem.displayName = 'FriendItem'

export function Friends({ user, t, onClose, cachedData }: FriendsProps) {
  const [friends, setFriends] = useState<Friend[]>(() => {
    // Use cached data if available for instant render
    if (cachedData && cachedData.length > 0) return cachedData
    const cached = localStorage.getItem('friendsCache')
    if (cached) {
      try {
        const { data } = JSON.parse(cached)
        return data || []
      } catch { return [] }
    }
    return []
  })
  const [friendInput, setFriendInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(() => {
    // If we have cached data, don't show loading
    if (cachedData && cachedData.length > 0) return false
    const cached = localStorage.getItem('friendsCache')
    return !cached
  })

  const API_URL = 'https://api.booleanclient.online'

  const fetchFriends = async (isInitial = false) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_URL}/friends?userId=${user.id}`, { signal: controller.signal })
      const data = await response.json()
      if (data.success) {
        setFriends(data.data)
        // Update cache
        const accepted = data.data.filter((f: Friend) => f.status === 'accepted')
        localStorage.setItem('friendsCache', JSON.stringify({
          count: accepted.length,
          data: data.data,
          timestamp: Date.now()
        }))
      }
      clearTimeout(timeoutId)
    } catch (error) {
      // Error fetching friends
    } finally {
      if (isInitial) setInitialLoading(false)
    }
  }

  const addFriend = async () => {
    if (!friendInput.trim()) return
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          friendUsername: friendInput.trim()
        })
      })
      const data = await response.json()
      if (data.success) {
        setFriendInput('')
        fetchFriends()
      } else {
        alert(data.message)
      }
    } catch (error) {
      // Error adding friend
    } finally {
      setLoading(false)
    }
  }

  const acceptFriend = async (friendshipId: number) => {
    try {
      await fetch(`${API_URL}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'accept',
          friendshipId
        })
      })
      fetchFriends()
    } catch (error) {
      // Error accepting friend
    }
  }

  const rejectFriend = async (friendshipId: number) => {
    try {
      await fetch(`${API_URL}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'reject',
          friendshipId
        })
      })
      fetchFriends()
    } catch (error) {
      // Error rejecting friend
    }
  }

  const removeFriend = async (friendshipId: number) => {
    try {
      await fetch(`${API_URL}/friends`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendshipId,
          userId: user.id
        })
      })
      fetchFriends()
    } catch (error) {
      // Error removing friend
    }
  }

  const isOnline = useCallback((friend: Friend) => {
    if (!friend.friend_last_active) return false
    const diff = Date.now() - new Date(friend.friend_last_active).getTime()
    return diff < 5 * 60 * 1000
  }, [])

  useEffect(() => {
    fetchFriends(true)
    const interval = setInterval(() => fetchFriends(false), 30000)
    return () => clearInterval(interval)
  }, [user.id])

  const acceptedFriends = useMemo(() => friends.filter(f => f.status === 'accepted'), [friends])
  const pendingRequests = useMemo(() => friends.filter(f => f.status === 'pending' && f.request_direction === 'incoming'), [friends])
  const pendingOutgoing = useMemo(() => friends.filter(f => f.status === 'pending' && f.request_direction === 'outgoing'), [friends])

  return (
    <div className="friends-fullscreen glass-card">
      <div className="friends-header">
        <button className="friends-back-btn" onClick={onClose}>
          <IoArrowBack size={20} />
        </button>
        <h2>{t.dashboard?.friends || 'Friends'}</h2>
      </div>

      <div className="friends-content">
        <div className="friends-add">
          <input
            type="text"
            value={friendInput}
            onChange={(e) => setFriendInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
            placeholder={t.dashboard?.enterFriendUsername || 'Enter nickname...'}
            className="friends-add-input"
          />
          <button 
            className="friends-add-btn"
            onClick={addFriend}
            disabled={!friendInput.trim() || loading}
          >
            <IoPersonAdd size={18} />
          </button>
        </div>

        {pendingRequests.length > 0 && (
          <div className="friends-section">
            <div className="friends-section-title">
              {t.dashboard?.friendRequests || 'Requests'} ({pendingRequests.length})
            </div>
            {pendingRequests.map(friend => (
              <div key={friend.id} className="friend-item pending">
                <img 
                  src={getAvatarUrl(friend.friend_avatar)} 
                  alt={friend.friend_username}
                  className="friend-avatar"
                />
                <div className="friend-info">
                  <span className="friend-name">{friend.friend_username}</span>
                </div>
                <div className="friend-actions">
                  <button className="accept-btn" onClick={() => acceptFriend(friend.id)}>
                    <IoCheckmark size={16} />
                  </button>
                  <button className="reject-btn" onClick={() => rejectFriend(friend.id)}>
                    <IoCloseCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {acceptedFriends.length > 0 && (
          <div className="friends-section">
            <div className="friends-section-title">
              {t.dashboard?.friends || 'Friends'} ({acceptedFriends.length})
            </div>
            {acceptedFriends.map(friend => (
              <FriendItem
                key={friend.id}
                friend={friend}
                isOnline={isOnline(friend)}
                onRemove={() => removeFriend(friend.id)}
              />
            ))}
          </div>
        )}

        {pendingOutgoing.length > 0 && (
          <div className="friends-section">
            <div className="friends-section-title">
              {t.dashboard?.pendingRequests || 'Pending'} ({pendingOutgoing.length})
            </div>
            {pendingOutgoing.map(friend => (
              <div key={friend.id} className="friend-item pending outgoing">
                <img 
                  src={getAvatarUrl(friend.friend_avatar)} 
                  alt={friend.friend_username}
                  className="friend-avatar"
                />
                <div className="friend-info">
                  <span className="friend-name">{friend.friend_username}</span>
                  <span className="friend-status">{t.dashboard?.requestSent || 'Sent'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {initialLoading ? (
          <div className="friends-empty">
            <span>{t.dashboard?.loading || 'Loading...'}</span>
          </div>
        ) : friends.length === 0 ? (
          <div className="friends-empty">
            <span>{t.dashboard?.noFriendsYet || 'No friends yet'}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
