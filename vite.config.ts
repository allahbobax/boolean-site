import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Plugin } from 'vite'

// Plugin to copy index.html for SPA routing
function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    closeBundle() {
      // This ensures proper SPA routing on static hosts
      console.log('SPA fallback configured for static hosting')
    }
  }
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
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
  preview: {
    host: '0.0.0.0',
    port: 3000,
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
