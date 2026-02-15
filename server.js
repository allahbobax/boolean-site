import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Убираем заголовок X-Powered-By
app.disable('x-powered-by');

// Явная установка MIME-типов для assets ПЕРЕД всеми остальными middleware
app.use('/assets/*', (req, res, next) => {
  const ext = path.extname(req.path);
  if (ext === '.js') {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (ext === '.css') {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Минимизируем информацию в заголовках
app.use((_req, res, next) => {
  // Убираем лишние заголовки
  res.removeHeader('X-Powered-By');
  
  // Добавляем security headers но без nosniff
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

// Check if assets folder exists and has required files
const assetsPath = path.join(distPath, 'assets');
if (existsSync(assetsPath)) {
  const assetFiles = readdirSync(assetsPath);
  console.log(`Files in assets: ${assetFiles.length}`);
  console.log('Asset files:', assetFiles);
} else {
  console.error('ERROR: assets folder not found!');
  process.exit(1);
}

// Serve static files from dist directory with proper caching and MIME types
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    const mimeType = mime.lookup(filePath);
    console.log(`Setting MIME type for ${filePath}: ${mimeType}`);
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
    }
  }
}));

// Serve other static files
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Устанавливаем правильные MIME-типы с помощью mime-types
    const mimeType = mime.lookup(filePath);
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
    }
    
    // Для HTML файлов отключаем кэширование, чтобы пользователи всегда видели новую версию
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
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
