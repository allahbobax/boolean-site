import { useState } from 'react'
import { LicenseKey } from '../../../types'
import { generateKey, getProductName, getProductColor } from '../utils/keyUtils'
import { AdminSubNav } from './AdminSubNav'

interface KeysTabProps {
  licenseKeys: LicenseKey[]
  onGenerateKeys: (keys: LicenseKey[]) => void
  onDeleteKey: (keyId: string) => void
  onCopyKey: (key: string) => void
}

type KeysSubTab = 'overview' | 'generator' | 'list'

export function KeysTab({ licenseKeys, onGenerateKeys, onDeleteKey, onCopyKey }: KeysTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<KeysSubTab>('overview')
  const [keyProduct, setKeyProduct] = useState<LicenseKey['product']>('premium')
  const [keyDuration, setKeyDuration] = useState<number>(30)
  const [keyCount, setKeyCount] = useState<number>(1)
  const [keysSearchQuery, setKeysSearchQuery] = useState('')

  const handleGenerateKeys = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    const newKeys: LicenseKey[] = []

    for (let i = 0; i < keyCount; i++) {
      const key: LicenseKey = {
        id: `${Date.now()}-${i}`,
        key: generateKey(),
        product: keyProduct,
        duration: keyDuration,
        createdAt: new Date().toISOString(),
        isUsed: false,
        createdBy: currentUser?.username || 'Admin'
      }
      newKeys.push(key)
    }

    onGenerateKeys(newKeys)
    setActiveSubTab('list')
  }

  const filteredKeys = licenseKeys.filter(k =>
    k.key.toLowerCase().includes(keysSearchQuery.toLowerCase()) ||
    getProductName(k.product).toLowerCase().includes(keysSearchQuery.toLowerCase())
  )

  const subNavItems = [
    {
      id: 'overview',
      label: 'Обзор',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      )
    },
    {
      id: 'generator',
      label: 'Генератор',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      )
    },
    {
      id: 'list',
      label: 'Список ключей',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z" />
        </svg>
      )
    }
  ]

  return (
    <div className="admin-section">
      <AdminSubNav
        items={subNavItems}
        activeId={activeSubTab}
        onChange={(id) => setActiveSubTab(id as KeysSubTab)}
      />

      {activeSubTab === 'overview' && (
        <div className="keys-stats">
          <div className="key-stat-card">
            <div className="key-stat-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
              </svg>
            </div>
            <div className="key-stat-info">
              <div className="key-stat-value">{licenseKeys.length}</div>
              <div className="key-stat-label">Всего ключей</div>
            </div>
          </div>

          <div className="key-stat-card">
            <div className="key-stat-icon available">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
            <div className="key-stat-info">
              <div className="key-stat-value">{licenseKeys.filter(k => !k.isUsed).length}</div>
              <div className="key-stat-label">Доступно</div>
            </div>
          </div>

          <div className="key-stat-card">
            <div className="key-stat-icon used">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div className="key-stat-info">
              <div className="key-stat-value">{licenseKeys.filter(k => k.isUsed).length}</div>
              <div className="key-stat-label">Использовано</div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'generator' && (
        <div className="key-generator-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
            Создать новые ключи
          </h3>

          <div className="generator-form">
            <div className="form-row">
              <div className="form-group">
                <label>Продукт</label>
                <select
                  value={keyProduct}
                  onChange={(e) => setKeyProduct(e.target.value as LicenseKey['product'])}
                >
                  <option value="premium">Premium подписка</option>
                  <option value="alpha">Alpha подписка</option>
                  <option value="inside-client">Shakedown Client</option>
                  <option value="inside-spoofer">Shakedown Spoofer</option>
                  <option value="inside-cleaner">Shakedown Cleaner</option>
                </select>
              </div>

              <div className="form-group">
                <label>Срок действия (дней)</label>
                <select
                  value={keyDuration}
                  onChange={(e) => setKeyDuration(Number(e.target.value))}
                >
                  <option value={1}>1 день</option>
                  <option value={7}>7 дней</option>
                  <option value={30}>30 дней</option>
                  <option value={90}>90 дней</option>
                  <option value={180}>180 дней</option>
                  <option value={365}>365 дней</option>
                  <option value={0}>Бессрочно</option>
                </select>
              </div>

              <div className="form-group">
                <label>Количество</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={keyCount}
                  onChange={(e) => setKeyCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                />
              </div>
            </div>

            <button className="btn-primary btn-generate" onClick={handleGenerateKeys}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Сгенерировать {keyCount} {keyCount === 1 ? 'ключ' : keyCount < 5 ? 'ключа' : 'ключей'}
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'list' && (
        <div className="keys-list-container">
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по ключу или продукту..."
              value={keysSearchQuery}
              onChange={(e) => setKeysSearchQuery(e.target.value)}
            />
          </div>

          <div className="keys-list">
            <h3>Созданные ключи ({licenseKeys.length})</h3>

            {licenseKeys.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3 }}>
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
                <p>Ключи ещё не созданы</p>
              </div>
            ) : (
              <div className="keys-table">
                <table>
                  <thead>
                    <tr>
                      <th>Ключ</th>
                      <th>Продукт</th>
                      <th>Срок</th>
                      <th>Создан</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.map(key => (
                      <tr key={key.id} className={key.isUsed ? 'used' : ''}>
                        <td>
                          <div className="key-cell">
                            <code className="key-code">{key.key}</code>
                            <button
                              className="btn-copy"
                              onClick={() => onCopyKey(key.key)}
                              title="Копировать"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 2a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V2zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V2a1 1 0 001-1H6zM2 5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1h1v1a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2h1v1H2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`product-badge ${getProductColor(key.product)}`}>
                            {getProductName(key.product)}
                          </span>
                        </td>
                        <td>{key.duration === 0 ? 'Бессрочно' : `${key.duration} дн.`}</td>
                        <td>{new Date(key.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td>
                          {key.isUsed ? (
                            <span className="status-badge used">
                              Использован
                              {key.usedBy && <small> ({key.usedBy})</small>}
                            </span>
                          ) : (
                            <span className="status-badge available">Доступен</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-action delete"
                            onClick={() => onDeleteKey(key.id)}
                            title="Удалить"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
