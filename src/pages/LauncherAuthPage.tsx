import { useEffect } from 'react'
import { getCurrentUser } from '../utils/database'
import { updateUser } from '../utils/api'
import { useTranslation } from '../hooks/useTranslation'
import '../styles/auth/AuthBase.css'
import '../styles/auth/AuthForm.css'

// Валидация порта - только числа от 1 до 65535
function validatePort(port: string | null): number {
    if (!port) return 3000;
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) return 3000;
    return portNum;
}

// Валидация HWID - только буквы, цифры и дефисы
function validateHwid(hwid: string | null): string | null {
    if (!hwid) return null;
    // Разрешаем только безопасные символы
    if (!/^[a-zA-Z0-9\-_]+$/.test(hwid)) return null;
    if (hwid.length > 128) return null;
    return hwid;
}

export default function LauncherAuthPage() {
    const { t } = useTranslation()
    useEffect(() => {
        // Небольшая задержка чтобы убедиться что localStorage инициализирован
        const checkAuth = setTimeout(async () => {
            let user = getCurrentUser()

            if (user) {
                // Получаем HWID и порт из параметров URL с валидацией
                const urlParams = new URLSearchParams(window.location.search)
                const port = validatePort(urlParams.get('port'))
                const hwid = validateHwid(urlParams.get('hwid'))

                // Если есть HWID и он отличается, обновляем его
                if (hwid && user.hwid !== hwid) {
                    try {
                        const result = await updateUser(user.id, { hwid })
                        if (result.success && result.data) {
                            // Обновляем локального пользователя с данными от сервера (где уже есть HWID)
                            // Но нам важнее, чтобы он был в user, который мы отправляем в лаунчер
                            // user = result.data // result.data might contain mapped user which is good

                            // Мы можем просто добавить hwid в текущий объект, если сервер вернул успех
                            user.hwid = hwid
                        }
                    } catch (e) {
                        // HWID update failed
                    }
                }

                // Кодируем данные пользователя для передачи в лаунчер
                const userData = encodeURIComponent(JSON.stringify(user))

                // Редиректим на локальный сервер лаунчера
                window.location.href = `http://127.0.0.1:${port}/callback?user=${userData}`

                // Закрываем окно после успешной отправки данных в лаунчер
                setTimeout(() => {
                    window.close()
                }, 1000)
            } else {
                // Если не авторизован, редиректим на страницу входа
                // Добавляем параметр чтобы после входа можно было вернуться (опционально)
                const urlParams = new URLSearchParams(window.location.search)
                const hwid = validateHwid(urlParams.get('hwid'))
                let redirectUrl = '/auth?redirect=launcher'
                if (hwid) {
                    redirectUrl += `&hwid=${encodeURIComponent(hwid)}`
                }
                window.location.href = redirectUrl
            }
        }, 500)

        return () => clearTimeout(checkAuth)
    }, [])

    return (
        <div className="auth-fullscreen">
            <div className="auth-page-centered">
                <div className="auth-box-clean" style={{ maxWidth: '420px' }}>
                    <div style={{
                        padding: '30px',
                        borderRadius: '24px',
                        background: '#000000',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                        color: '#ffffff'
                    }}>
                        <div className="launcher-auth-spinner" />
                        <div className="auth-title-clean">
                            <h2 style={{ marginBottom: '6px' }}>{t.auth.checkingAuth}</h2>
                            <p style={{ margin: 0 }}>{t.auth.pleaseWait}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
