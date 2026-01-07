import { useState, useEffect } from 'react'
import '../../../styles/dashboard/Settings.css'
import { User } from '../../../types'
import { IoSend } from 'react-icons/io5'

interface SettingsTabProps {
  user: User
  formatDate: (date: string) => string
  t: any
}

export function SettingsTab({ user: _user, formatDate: _formatDate, t }: SettingsTabProps) {
  const [friendUsername, setFriendUsername] = useState('')
  const [isTreeAnimated, setIsTreeAnimated] = useState(false)

  useEffect(() => {
    const hasSeenAnimation = localStorage.getItem('treeAnimationSeen')
    if (!hasSeenAnimation) {
      setIsTreeAnimated(true)
      localStorage.setItem('treeAnimationSeen', 'true')
    }
  }, [])

  const handleAddFriend = () => {
    if (!friendUsername.trim()) return
    // Здесь будет логика добавления друга
    setFriendUsername('')
  }


  return (
    <div className="dashboard-content">
      <div className="settings-card">
        <div className="setting-item">
          <div className="setting-info">
            <h4>{t.dashboard?.addFriend || 'Add Friend'}</h4>
          </div>
          <div className="friend-input-wrapper">
            <input
              type="text"
              className="friend-input"
              placeholder={t.dashboard.enterFriendUsername}
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
            />
            <button
              className="telegram-send-btn"
              onClick={handleAddFriend}
              disabled={!friendUsername.trim()}
              title={t.dashboard?.addFriend || 'Add Friend'}
            >
              <IoSend />
            </button>
            <img
              src="/12.png"
              alt="Friend"
              className={`friend-avatar ${isTreeAnimated ? 'animate' : ''}`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
