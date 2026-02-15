import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Убираем заголовок X-Powered-By
app.disable('x-powered-by');

// Минимизируем информацию в заголовках
app.use((_req, res, next) => {
  // Убираем лишние заголовки
  res.removeHeader('X-Powered-By');
  
  // Добавляем security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Отключаем устаревший XSS фильтр браузера
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.booleanclient.online https://*.booleanclient.online;");
  next();
});

// Log startup info
console.log(`Starting server at ${new Date().toISOString()}`);
console.log(`Current directory: ${__dirname}`);
console.log(`Dist path: ${path.join(__dirname, 'dist')}`);

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error('ERROR: dist folder not found!');
  console.error('Please run "npm run build" first');
  process.exit(1);
}

const distFiles = readdirSync(distPath);
console.log(`Files in dist: ${distFiles.length}`);
if (!distFiles.includes('index.html')) {
  console.error('ERROR: index.html not found in dist folder!');
  process.exit(1);
}
console.log('✓ dist folder is ready');

// Serve static files from dist directory with proper caching and MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Для HTML файлов отключаем кэширование, чтобы пользователи всегда видели новую версию
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // Устанавливаем правильные MIME-типы для статических ресурсов
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

// Handle SPA routing - send all requests to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
