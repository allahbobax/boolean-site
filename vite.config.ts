import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Plugin } from 'vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 8080,
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
  preview: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: ['boolean-site.onrender.com']
  },
  build: {
    outDir: 'dist',
    // Копируем _redirects файл для Render
    copyPublicDir: true,
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
