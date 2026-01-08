import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LicenseKey, ClientVersion } from '../../../types'
import { getLicenseKeys, createLicenseKeys, deleteLicenseKey } from '../../../utils/keys'
import { getClientVersions, createClientVersion, updateClientVersion, deleteClientVersion } from '../../../utils/versions'
import { API_URL, getProtectedHeaders } from '../../../utils/apiConfig'

export function useAdminData() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([])
  const [clientVersions, setClientVersions] = useState<ClientVersion[]>([])

  const loadClientVersions = async () => {
    try {
      const result = await getClientVersions()
      if (result.success && result.data) {
        setClientVersions(result.data)
        return
      }
    } catch (error) {
      // Failed to load versions via API
    }
    setClientVersions([])
  }

  const createVersion = async (payload: { version: string; downloadUrl: string; description?: string; isActive?: boolean }) => {
    const result = await createClientVersion(payload)
    if (result?.success) {
      await loadClientVersions()
    }
    return result
  }

  const updateVersion = async (id: number, updates: Partial<Pick<ClientVersion, 'version' | 'downloadUrl' | 'description' | 'isActive'>>) => {
    const result = await updateClientVersion(id, updates)
    if (result?.success) {
      await loadClientVersions()
    }
    return result
  }

  const deleteVersion = async (id: number) => {
    const result = await deleteClientVersion(id)
    if (result?.success) {
      await loadClientVersions()
    }
    return result
  }

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!currentUser?.isAdmin) {
      navigate('/')
      return
    }

    loadUsers()
    loadLicenseKeys()
    loadClientVersions()
  }, [navigate])

  const loadUsers = async () => {
    try {
      const result = await fetch(`${API_URL}/users`, {
        headers: getProtectedHeaders(),
      })
      if (result.ok) {
        const data = await result.json()
        if (data.success && data.data) {
          setUsers(data.data)
          return
        }
      }
    } catch (error) {
      // Failed to load users from API
    }
    // БЕЗОПАСНОСТЬ: Не загружаем пользователей из localStorage
    // Если API недоступен, показываем пустой список
    console.warn('API unavailable, cannot load users')
    setUsers([])
  }

  const loadLicenseKeys = async () => {
    try {
      const result = await getLicenseKeys()
      if (result.success && result.data) {
        setLicenseKeys(result.data)
        return
      }
    } catch (error) {
      // Failed to load keys from API
    }
    // Fallback to localStorage
    const savedKeys = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    setLicenseKeys(savedKeys)
  }

  const createKeys = async (newKeys: LicenseKey[]) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      const keysWithCreator = newKeys.map(key => ({
        ...key,
        createdBy: currentUser?.id
      }))
      
      const result = await createLicenseKeys(keysWithCreator)
      if (result.success) {
        await loadLicenseKeys()
        return result
      }
    } catch (error) {
      // Failed to create keys via API
    }
    
    // Fallback to localStorage
    const updatedKeys = [...newKeys, ...licenseKeys]
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    return { success: true, data: updatedKeys }
  }

  const deleteKey = async (keyId: string) => {
    try {
      const result = await deleteLicenseKey(keyId)
      if (result.success) {
        await loadLicenseKeys()
        return result
      }
    } catch (error) {
      // Failed to delete key via API
    }
    
    // Fallback to localStorage
    const updatedKeys = licenseKeys.filter(k => k.id !== keyId)
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    return { success: true, message: 'Ключ удален' }
  }

  return {
    users,
    setUsers,
    licenseKeys,
    setLicenseKeys,
    clientVersions,
    setClientVersions,
    loadUsers,
    loadLicenseKeys,
    loadClientVersions,
    createKeys,
    deleteKey,
    createVersion,
    updateVersion,
    deleteVersion
  }
}
