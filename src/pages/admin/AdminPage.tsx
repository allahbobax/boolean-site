import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LicenseKey } from '../../types'
import Notification from '../../components/Notification'
import { LogoutModal } from '../../components/LogoutModal'
import { useAdminData } from './hooks/useAdminData'
import {
  AdminSidebar,
  UsersTab,
  ActivityTab,
  KeysTab,
  VersionsTab,
  IncidentsTab
} from './components'
import { getProductName } from './utils/keyUtils'
import '../../styles/admin/index.css'

const API_URL = 'https://api.booleanclient.online'

type TabType = 'users' | 'activity' | 'keys' | 'versions' | 'incidents'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const {
    users,
    setUsers,
    licenseKeys,
    createKeys,
    deleteKey,
    clientVersions,
    createVersion,
    updateVersion,
    deleteVersion
  } = useAdminData()

  const handleBanUser = async (userId: number | string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const newBanStatus = !user.isBanned

    try {
      const response = await fetch(`${API_URL}/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBanStatus })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const updatedUsers = users.map(u => u.id === userId ? data.data : u)
          setUsers(updatedUsers)
          setNotification({
            message: newBanStatus ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
            type: 'info'
          })
          return
        }
      }
    } catch (error) {
      // Ban user error
    }

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, isBanned: newBanStatus } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('insideUsers', JSON.stringify(updatedUsers))
    setNotification({
      message: newBanStatus ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      type: 'info'
    })
  }

  const handleDeleteUser = (userId: number | string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    const updatedUsers = users.filter(u => u.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem('insideUsers', JSON.stringify(updatedUsers))
    setNotification({ message: 'Пользователь удален', type: 'info' })
  }

  const handleGenerateKeys = async (newKeys: LicenseKey[]) => {
    const result = await createKeys(newKeys)

    if (result.success) {
      const keyCount = newKeys.length
      setNotification({
        message: `Создано ${keyCount} ${keyCount === 1 ? 'ключ' : keyCount < 5 ? 'ключа' : 'ключей'} для ${getProductName(newKeys[0].product)}`,
        type: 'success'
      })
    } else {
      setNotification({ message: 'Ошибка при создании ключей', type: 'error' })
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    const result = await deleteKey(keyId)

    if (result.success) {
      setNotification({ message: result.message || 'Ключ удален', type: 'info' })
    } else {
      setNotification({ message: 'Ошибка при удалении ключа', type: 'error' })
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setNotification({ message: 'Ключ скопирован в буфер обмена', type: 'success' })
  }

  const handleCreateVersion = async (payload: { version: string; downloadUrl: string; description?: string; isActive?: boolean }) => {
    const result = await createVersion(payload)
    if (result.success) {
      setNotification({ message: 'Версия добавлена', type: 'success' })
    } else {
      setNotification({ message: result.message || 'Ошибка при добавлении версии', type: 'error' })
    }
  }

  const handleUpdateVersion = async (id: number, updates: any) => {
    const result = await updateVersion(id, updates)
    if (result.success) {
      setNotification({ message: 'Версия обновлена', type: 'success' })
    } else {
      setNotification({ message: result.message || 'Ошибка при обновлении версии', type: 'error' })
    }
  }

  const handleDeleteVersion = async (id: number) => {
    const result = await deleteVersion(id)
    if (result.success) {
      setNotification({ message: result.message || 'Версия удалена', type: 'info' })
    } else {
      setNotification({ message: result.message || 'Ошибка при удалении версии', type: 'error' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/')
  }

  return (
    <div className="admin-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usersCount={users.length}
        availableKeysCount={licenseKeys.filter(k => !k.isUsed).length}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      <main className="admin-main">
        <div className="admin-content-header">
          {/* Page headers removed for cleaner app-like look */}
        </div>

        <div className="admin-content-body">
          {activeTab === 'users' && (
            <UsersTab
              users={users}
              onBanUser={handleBanUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab users={users} />
          )}

          {activeTab === 'keys' && (
            <KeysTab
              licenseKeys={licenseKeys}
              onGenerateKeys={handleGenerateKeys}
              onDeleteKey={handleDeleteKey}
              onCopyKey={handleCopyKey}
            />
          )}

          {activeTab === 'versions' && (
            <VersionsTab
              versions={clientVersions}
              onCreateVersion={handleCreateVersion}
              onUpdateVersion={handleUpdateVersion}
              onDeleteVersion={handleDeleteVersion}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsTab
              onNotification={(message, type) => setNotification({ message, type })}
            />
          )}
        </div>
      </main>
    </div>
  )
}
