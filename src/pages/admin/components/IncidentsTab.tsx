import { useState, useEffect } from 'react'
import { AdminSubNav } from './AdminSubNav'

const API_URL = 'https://api.booleanclient.online'

interface IncidentUpdate {
  id: string
  status: string
  message: string
  createdAt: string
}

interface Incident {
  id: string
  title: string
  description: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'minor' | 'major' | 'critical'
  affectedServices: string[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  updates: IncidentUpdate[]
}

interface IncidentsTabProps {
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

const SERVICES = ['API', 'Authorization', 'Website', 'Database', 'CDN', 'Launcher']
const STATUSES = ['investigating', 'identified', 'monitoring', 'resolved'] as const
const SEVERITIES = ['minor', 'major', 'critical'] as const

type IncidentsSubTab = 'list' | 'create' | 'update'

export function IncidentsTab({ onNotification }: IncidentsTabProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState<IncidentsSubTab>('list')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('minor')
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Update form state
  const [updateStatus, setUpdateStatus] = useState<typeof STATUSES[number]>('investigating')
  const [updateMessage, setUpdateMessage] = useState('')

  const subNavItems = [
    {
      id: 'list',
      label: 'Все инциденты',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    {
      id: 'create',
      label: 'Создать инцидент',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      )
    }
  ]

  const getCurrentUser = () => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/incidents`)
      const data = await response.json()
      if (data.success) {
        setIncidents(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  const handleCreateIncident = async () => {
    const user = getCurrentUser()
    if (!user) {
      onNotification('Необходимо авторизоваться', 'error')
      return
    }

    if (!title.trim()) {
      onNotification('Введите название инцидента', 'error')
      return
    }

    try {
      const response = await fetch(`${API_URL}/incidents?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          severity,
          affectedServices: selectedServices
        })
      })

      const data = await response.json()
      if (data.success) {
        onNotification('Инцидент создан', 'success')
        resetForm()
        fetchIncidents()
        setActiveSubTab('list')
      } else {
        onNotification(data.message || 'Ошибка создания', 'error')
      }
    } catch (error) {
      onNotification('Ошибка сервера', 'error')
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedIncident) return

    const user = getCurrentUser()
    if (!user) {
      onNotification('Необходимо авторизоваться', 'error')
      return
    }

    if (!updateMessage.trim()) {
      onNotification('Введите сообщение', 'error')
      return
    }

    try {
      const response = await fetch(`${API_URL}/incidents/update?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          status: updateStatus,
          message: updateMessage
        })
      })

      const data = await response.json()
      if (data.success) {
        onNotification('Обновление добавлено', 'success')
        setUpdateMessage('')
        setSelectedIncident(null)
        fetchIncidents()
        setActiveSubTab('list')
      } else {
        onNotification(data.message || 'Ошибка', 'error')
      }
    } catch (error) {
      onNotification('Ошибка сервера', 'error')
    }
  }

  
  const handleDeleteIncident = async (id: string) => {
    if (!confirm('Удалить инцидент?')) return

    const user = getCurrentUser()
    if (!user) return

    try {
      const response = await fetch(`${API_URL}/incidents/${id}?userId=${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (data.success) {
        onNotification('Инцидент удален', 'info')
        fetchIncidents()
      }
    } catch (error) {
      onNotification('Ошибка удаления', 'error')
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSeverity('minor')
    setSelectedServices([])
  }

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const openUpdateTab = (incident: Incident) => {
    setSelectedIncident(incident)
    setUpdateStatus(incident.status)
    setUpdateMessage('')
    setActiveSubTab('update')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return '#ef4444'
      case 'major': return '#f59e0b'
      default: return '#3b82f6'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#22c55e'
      case 'monitoring': return '#3b82f6'
      case 'identified': return '#f59e0b'
      default: return '#ef4444'
    }
  }

  const handleSubTabChange = (id: string) => {
    if (id === 'list' || id === 'create') {
      setActiveSubTab(id as IncidentsSubTab)
      if (id === 'create') {
        resetForm()
      }
      if (id === 'list') {
        setSelectedIncident(null)
      }
    }
  }

  if (loading) {
    return <div className="admin-loading">Загрузка...</div>
  }

  return (
    <div className="incidents-tab admin-section">
      <AdminSubNav
        items={activeSubTab === 'update' ? [...subNavItems, {
          id: 'update',
          label: 'Обновить инцидент',
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          )
        }] : subNavItems}
        activeId={activeSubTab}
        onChange={handleSubTabChange}
      />

      {activeSubTab === 'list' && (
        <div className="incidents-list">
          {incidents.length === 0 ? (
            <div className="no-incidents">Нет инцидентов</div>
          ) : (
            incidents.map(incident => (
              <div key={incident.id} className="incident-card">
                <div className="incident-header" onClick={() => setExpandedIncident(
                  expandedIncident === incident.id ? null : incident.id
                )}>
                  <div className="incident-info">
                    <span
                      className="incident-severity"
                      style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    >
                      {incident.severity}
                    </span>
                    <span
                      className="incident-status"
                      style={{ backgroundColor: getStatusColor(incident.status) }}
                    >
                      {incident.status}
                    </span>
                    <h3>{incident.title}</h3>
                  </div>
                  <div className="incident-meta">
                    <span>{formatDate(incident.createdAt)}</span>
                    <span className="expand-icon">{expandedIncident === incident.id ? '▼' : '▶'}</span>
                  </div>
                </div>

                {expandedIncident === incident.id && (
                  <div className="incident-details">
                    <p className="incident-description">{incident.description}</p>
                    
                    {incident.affectedServices.length > 0 && (
                      <div className="affected-services">
                        <strong>Затронутые сервисы:</strong>
                        {incident.affectedServices.map(s => (
                          <span key={s} className="service-tag">{s}</span>
                        ))}
                      </div>
                    )}

                    {incident.updates.length > 0 && (
                      <div className="incident-updates">
                        <h4>История обновлений</h4>
                        {incident.updates.map(update => (
                          <div key={update.id} className="update-item">
                            <span
                              className="update-status"
                              style={{ backgroundColor: getStatusColor(update.status) }}
                            >
                              {update.status}
                            </span>
                            <span className="update-message">{update.message}</span>
                            <span className="update-time">{formatDate(update.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="incident-actions">
                      {incident.status !== 'resolved' && (
                        <button
                          className="btn-secondary"
                          onClick={() => openUpdateTab(incident)}
                        >
                          Добавить обновление
                        </button>
                      )}
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteIncident(incident.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'create' && (
        <div className="incident-form-card">
          <h3>Создать новый инцидент</h3>
          
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Краткое описание проблемы"
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Подробное описание"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Серьезность</label>
            <div className="severity-buttons">
              {SEVERITIES.map(sev => (
                <button
                  key={sev}
                  className={`severity-btn ${severity === sev ? 'active' : ''}`}
                  style={severity === sev ? { borderColor: getSeverityColor(sev), background: `${getSeverityColor(sev)}20` } : {}}
                  onClick={() => setSeverity(sev)}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Затронутые сервисы</label>
            <div className="services-grid">
              {SERVICES.map(service => (
                <button
                  key={service}
                  type="button"
                  className={`service-btn ${selectedServices.includes(service) ? 'active' : ''}`}
                  onClick={() => toggleService(service)}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setActiveSubTab('list')}>
              Отмена
            </button>
            <button className="btn-primary" onClick={handleCreateIncident}>
              Создать инцидент
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'update' && selectedIncident && (
        <div className="incident-form-card">
          <h3>Обновить инцидент</h3>
          <p className="form-subtitle">{selectedIncident.title}</p>

          <div className="form-group">
            <label>Новый статус</label>
            <div className="status-buttons">
              {STATUSES.map(status => (
                <button
                  key={status}
                  className={`status-btn ${updateStatus === status ? 'active' : ''}`}
                  style={updateStatus === status ? { borderColor: getStatusColor(status), background: `${getStatusColor(status)}20` } : {}}
                  onClick={() => setUpdateStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Сообщение</label>
            <textarea
              value={updateMessage}
              onChange={e => setUpdateMessage(e.target.value)}
              placeholder="Что изменилось?"
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => {
              setSelectedIncident(null)
              setActiveSubTab('list')
            }}>
              Отмена
            </button>
            <button className="btn-primary" onClick={handleAddUpdate}>
              Добавить обновление
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
