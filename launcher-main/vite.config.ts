import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Очищаем экран при HMR обновлениях
  clearScreen: false,
  
  server: {
    port: 1420,
    strictPort: true,
    host: '127.0.0.1',
    // Включаем HMR
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 1420,
    },
    // Следим за изменениями
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})
