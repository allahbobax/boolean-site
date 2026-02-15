import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './styles/favicon.css'

const API_URL = 'https://api.booleanclient.online'

// Прогрев serverless функций при загрузке (уменьшает cold start)
const warmupAPIs = () => {
  const user = localStorage.getItem('currentUser')
  if (user) {
    try {
      const { id } = JSON.parse(user)
      if (id) {
        // Прогреваем friends API в фоне с timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        fetch(`${API_URL}/friends?userId=${id}`, { signal: controller.signal })
          .catch(() => {})
          .finally(() => clearTimeout(timeoutId))
      }
    } catch {}
  }
}
// Запускаем прогрев сразу
warmupAPIs()

// Скрытая функция для локального тестирования (вызов из консоли: local_auth_test())
declare global {
  interface Window {
    local_auth_test: (username?: string, email?: string, password?: string) => Promise<void>;
    local_test_show111: () => void;
  }
}

window.local_auth_test = async (
  username = 'test_user_' + Math.random().toString(36).substr(2, 5),
  email = 'test' + Math.random().toString(36).substr(2, 5) + '@local.dev'
) => {
  // Фейк данные пользователя
  const fakeUser = {
    id: Math.floor(Math.random() * 10000),
    username: username,
    email: email,
    subscription: 'free',
    registeredAt: new Date().toISOString(),
    isAdmin: false,
    isBanned: false,
    emailVerified: true,
    settings: '{}'
  };
  
  localStorage.setItem('currentUser', JSON.stringify(fakeUser));
};

// Функция для тестирования модального окна верификации
window.local_test_show111 = () => {
  // Создаем фейковое событие для показа модалки
  const event = new CustomEvent('showVerificationModal', {
    detail: {
      userId: 'test_user_' + Math.random().toString(36).substr(2, 8),
      email: 'test' + Math.random().toString(36).substr(2, 5) + '@example.com'
    }
  });
  window.dispatchEvent(event);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
