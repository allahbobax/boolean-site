import './utils/tauri-bridge'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Отключаем контекстное меню браузера
document.addEventListener('contextmenu', (e) => e.preventDefault())

// Блокируем обновление страницы через все комбинации клавиш
document.addEventListener('keydown', (e) => {
  // Блокируем F5, Ctrl+R, Ctrl+Shift+R, Ctrl+Win+F5
  if (
    e.key === 'F5' ||
    (e.ctrlKey && e.key === 'r') ||
    (e.ctrlKey && e.shiftKey && e.key === 'r') ||
    (e.ctrlKey && e.metaKey && e.key === 'r')
  ) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
  
  // Дополнительная блокировка для некоторых комбинаций
  if (e.key === 'F12') {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
})

// Блокируем стандартное поведение обновления
window.addEventListener('beforeunload', (e) => {
  e.preventDefault()
  e.returnValue = ''
  return ''
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
