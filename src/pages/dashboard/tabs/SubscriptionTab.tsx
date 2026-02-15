import { User } from '../../../types'
import { IconDiamond } from '../../../components/Icons'

interface Props {
  user: User
  badge: { text: string; class: string }
  keyInput: string
  setKeyInput: (value: string) => void
  handleActivateKey: () => void
  t: any
}

export function SubscriptionTab({
  user,
  badge,
  keyInput,
  setKeyInput,
  handleActivateKey,
  t
}: Props) {
  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>{t.dashboard.subscription}</h1>
        <p>{t.dashboard.subscriptionManagement}</p>
      </div>

      <div className="subscription-status">
        <div className="current-plan">
          <div className={`plan-badge ${badge.class}`}>
            <IconDiamond size={32} />
          </div>
          <div className="plan-info">
            <h3>{t.dashboard.currentPlan}: {badge.text}</h3>
            <p>{user.subscription === 'free' ? t.dashboard.upgradeForFeatures : t.dashboard.activeSubscription}</p>
          </div>
        </div>
      </div>

      <div className="key-activation">
        <h2>{t.dashboard.keyActivation}</h2>
        <div className="key-input-group">
          <input
            type="text"
            className="key-input"
            placeholder={t.dashboard.keyPlaceholder}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
          />
          <button className="activate-btn" onClick={handleActivateKey}>
            {t.dashboard.activate}
          </button>
        </div>
        <p className="key-hint">{t.dashboard.keyHint}</p>
      </div>
    </div>
  )
}
