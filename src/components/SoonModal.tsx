import React from 'react'

interface SoonModalProps {
  isOpen: boolean
  title?: string
  message?: string
  onClose: () => void
}

export const SoonModal: React.FC<SoonModalProps> = ({
  isOpen,
  title = 'Soon...',
  message = 'Скоро',
  onClose
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-confirm" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
