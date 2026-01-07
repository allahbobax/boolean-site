import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    watch: {
      usePolling: false
    }
  },
  build: {
    outDir: 'dist',
    // Оптимизации для production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Code splitting для лучшего кэширования
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['react-icons']
        }
      }
    },
    // Уменьшаем размер чанков
    chunkSizeWarningLimit: 500
  },
  logLevel: 'error'
})
