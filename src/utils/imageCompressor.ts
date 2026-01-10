/**
 * Утилита для сжатия изображений перед загрузкой
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.85,
  maxSizeKB: 200
}

/**
 * Сжимает изображение до указанных параметров
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        // Масштабируем если нужно
        if (width > opts.maxWidth! || height > opts.maxHeight!) {
          const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height)
        
        // Конвертируем в base64 с нужным качеством
        let quality = opts.quality!
        let base64 = canvas.toDataURL('image/jpeg', quality)
        
        // Если размер всё ещё большой, уменьшаем качество
        while (base64.length > opts.maxSizeKB! * 1024 * 1.37 && quality > 0.3) {
          quality -= 0.1
          base64 = canvas.toDataURL('image/jpeg', quality)
        }
        
        resolve(base64)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Проверяет, нужно ли сжимать изображение
 */
export function needsCompression(file: File, maxSizeKB: number = 200): boolean {
  return file.size > maxSizeKB * 1024
}
