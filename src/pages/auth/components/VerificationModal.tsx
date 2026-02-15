import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyEmailCode, resendVerificationCode } from '../../../utils/api'
import { Database, setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'
import { useTranslation } from '../../../hooks/useTranslation'

interface VerificationModalProps {
  pendingUserId: string | null
  addNotification: (message: string, type: NotificationType) => void
  onClose: () => void
}

export function VerificationModal({ pendingUserId, addNotification, onClose }: VerificationModalProps) {
  const { t } = useTranslation()
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])


  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  const applyDigitsFrom = (startIndex: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return

    const newCode = [...verificationCode]
    let idx = startIndex
    for (const d of digits) {
      if (idx > 5) break
      newCode[idx] = d
      idx += 1
    }
    setVerificationCode(newCode)

    if (idx <= 5) focusIndex(idx)
    else focusIndex(5)
  }

  const findPasteStartIndex = () => {
    const firstEmpty = verificationCode.findIndex((d) => !d)
    return firstEmpty === -1 ? 0 : firstEmpty
  }

  const handleVerificationCodeChange = (index: number, rawValue: string) => {
    if (!rawValue) {
      const newCode = [...verificationCode]
      newCode[index] = ''
      setVerificationCode(newCode)
      return
    }

    const digits = rawValue.replace(/\D/g, '')
    if (!digits) return

    if (digits.length === 1) {
      const newCode = [...verificationCode]
      newCode[index] = digits
      setVerificationCode(newCode)

      if (index < 5) focusIndex(index + 1)
      return
    }

    applyDigitsFrom(index, digits)
  }


  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Ctrl+A - очистить все поля
    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      setVerificationCode(['', '', '', '', '', ''])
      focusIndex(0)
      return
    }

    // Backspace - если поле пустое, перейти к предыдущему
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0) {
        focusIndex(index - 1)
        return
      }
      
      if (verificationCode[index]) {
        const newCode = [...verificationCode]
        newCode[index] = ''
        setVerificationCode(newCode)
        e.preventDefault()
        return
      }
    }

    // Стрелка влево
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusIndex(index - 1)
      return
    }

    // Стрелка вправо
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      focusIndex(index + 1)
      return
    }
  }

  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    if (code.length !== 6) {
      addNotification(t.auth.enterCode, 'error')
      return
    }

    if (!pendingUserId) {
      addNotification(t.auth.errorUserNotFound, 'error')
      return
    }

    setIsVerifying(true)
    const result = await verifyEmailCode(pendingUserId, code)
    setIsVerifying(false)

    if (result.success) {
      addNotification(result.message, 'success')
      onClose()
      
      const db = new Database()
      const userResult = await db.getUserById(pendingUserId)
      if (userResult.success && userResult.user) {
        setCurrentUser(userResult.user)
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } else {
      addNotification(result.message, 'error')
    }
  }

  const handleResendCode = async () => {
    if (!pendingUserId) return

    const result = await resendVerificationCode(pendingUserId)
    if (result.success) {
      addNotification(result.message, 'success')
      setVerificationCode(['', '', '', '', '', ''])
    } else {
      addNotification(result.message, 'error')
    }
  }

  const handleVerificationCodePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    applyDigitsFrom(index, e.clipboardData.getData('text'))
  }

  return (
    <div className="email-verification-overlay" onClick={onClose}>
      <div className="email-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="email-verification-header">
          <h2 className="email-verification-title">{t.auth.codeVerification}</h2>
          <button className="email-verification-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="email-verification-content">
          <p className="email-verification-text">{t.auth.verificationSent}</p>
          
          <div className="email-verification-code-inputs" onPaste={(e) => {
              e.preventDefault()
              applyDigitsFrom(findPasteStartIndex(), e.clipboardData.getData('text'))
            }}>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                onPaste={(e) => handleVerificationCodePaste(index, e)}
                onFocus={() => inputRefs.current[index]?.select()}
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                className="email-verification-code-input"
              />
            ))}
          </div>

          <p className="email-verification-hint"></p>

          <div className="email-verification-actions">
            <button
              className="email-verification-btn email-verification-btn--primary"
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.join('').length !== 6}
            >
              {isVerifying ? t.auth.verifying : t.auth.confirm}
            </button>

            <button
              className="email-verification-btn email-verification-btn--secondary"
              onClick={handleResendCode}
              disabled={isVerifying}
            >
              {t.auth.sendCodeAgain}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
