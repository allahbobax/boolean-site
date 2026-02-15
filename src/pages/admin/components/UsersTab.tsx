import { useState } from 'react'
import { User } from '../../../types'
import { getAvatarUrl } from '../../../utils/avatarGenerator'
import { AdminSubNav } from './AdminSubNav'

interface UsersTabProps {
  users: User[]
  onBanUser: (userId: number | string) => void
  onDeleteUser: (userId: number | string) => void
}

type UsersSubTab = 'list' | 'stats'

export function UsersTab({ users, onBanUser, onDeleteUser }: UsersTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<UsersSubTab>('list')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const subNavItems = [
    {
      id: 'list',
      label: 'Список пользователей',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      )
    },
    {
      id: 'stats',
      label: 'Статистика ролей',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      )
    }
  ]

  const premiumCount = users.filter(u => u.subscription === 'premium').length
  const alphaCount = users.filter(u => u.subscription === 'alpha').length
  const freeCount = users.filter(u => u.subscription === 'free').length
  const bannedCount = users.filter(u => u.isBanned).length

  return (
    <div className="admin-section">
      <AdminSubNav
        items={subNavItems}
        activeId={activeSubTab}
        onChange={(id) => setActiveSubTab(id as UsersSubTab)}
      />

      {activeSubTab === 'list' && (
        <>
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Подписка</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={user.isBanned ? 'banned' : ''}>
                    <td>
                      <div className="user-cell">
                        <img src={getAvatarUrl(user.avatar)} alt={user.username} className="user-avatar" />
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`subscription-badge ${user.subscription}`}>
                        {user.subscription === 'premium' ? 'Premium' :
                          user.subscription === 'alpha' ? 'Alpha' : 'Free'}
                      </span>
                    </td>
                    <td>
                      {user.isBanned ? (
                        <span className="status-badge banned">Заблокирован</span>
                      ) : (
                        <span className="status-badge active">Активен</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn-action ${user.isBanned ? 'unban' : 'ban'}`}
                          onClick={() => onBanUser(user.id)}
                          title={user.isBanned ? 'Разблокировать' : 'Заблокировать'}
                        >
                          {user.isBanned ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM4.5 7.5a.5.5 0 010-1h7a.5.5 0 010 1h-7z" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                              <path d="M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708z" />
                            </svg>
                          )}
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => onDeleteUser(user.id)}
                          title="Удалить"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <p>Пользователи не найдены</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeSubTab === 'stats' && (
        <div className="activity-info-grid">
          <div className="info-card">
            <div className="info-content">
              <div className="info-value">{premiumCount}</div>
              <div className="info-label">Premium аккаунты</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-content">
              <div className="info-value">{alphaCount}</div>
              <div className="info-label">Alpha тестеры</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-content">
              <div className="info-value">{freeCount}</div>
              <div className="info-label">Бесплатные</div>
            </div>
          </div>
          <div className="info-card danger">
            <div className="info-content">
              <div className="info-value">{bannedCount}</div>
              <div className="info-label">Заблокировано</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
