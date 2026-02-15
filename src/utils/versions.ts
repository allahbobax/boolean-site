import { ClientVersion } from '../types'
import { API_URL, getProtectedHeaders } from './apiConfig'

export const getClientVersions = async () => {
  try {
    const response = await fetch(`${API_URL}/versions`, {
      headers: getProtectedHeaders(),
    })
    if (response.ok) {
      const data = await response.json()
      return data
    }
    return { success: false, message: 'Failed to fetch versions' }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export const createClientVersion = async (payload: {
  version: string
  downloadUrl: string
  description?: string
  isActive?: boolean
}) => {
  try {
    const response = await fetch(`${API_URL}/versions`, {
      method: 'POST',
      headers: getProtectedHeaders(),
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }

    const errorData = await response.json().catch(() => null)
    return errorData || { success: false, message: 'Failed to create version' }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export const updateClientVersion = async (
  id: number,
  updates: Partial<Pick<ClientVersion, 'version' | 'downloadUrl' | 'description' | 'isActive'>>
) => {
  try {
    const response = await fetch(`${API_URL}/versions?id=${id}`, {
      method: 'PATCH',
      headers: getProtectedHeaders(),
      body: JSON.stringify(updates)
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }

    const errorData = await response.json().catch(() => null)
    return errorData || { success: false, message: 'Failed to update version' }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export const deleteClientVersion = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/versions?id=${id}`, {
      method: 'DELETE',
      headers: getProtectedHeaders(),
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }

    return { success: false, message: 'Failed to delete version' }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}
