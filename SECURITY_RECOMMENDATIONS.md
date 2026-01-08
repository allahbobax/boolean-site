# Дополнительные рекомендации по безопасности

## Приоритет: ВЫСОКИЙ

### 1. Реализация 2FA (Two-Factor Authentication)

**Для кого:** Обязательно для администраторов, опционально для пользователей

**Реализация:**

```typescript
// backend-vercel/api/lib/totp.ts
import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';

export function generateTOTPSecret(username: string) {
  const totp = new OTPAuth.TOTP({
    issuer: 'Boolean Client',
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });
  
  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQRCode(uri: string): Promise<string> {
  return await QRCode.toDataURL(uri);
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}
```

**Изменения в БД:**

```sql
ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN backup_codes TEXT[];
```

**Новые эндпоинты:**

- `POST /auth/2fa/setup` - Генерация QR кода
- `POST /auth/2fa/verify` - Проверка кода при входе
- `POST /auth/2fa/enable` - Включение 2FA
- `POST /auth/2fa/disable` - Отключение 2FA
- `GET /auth/2fa/backup-codes` - Генерация резервных кодов

---

### 2. Refresh Tokens

**Проблема:** Текущие JWT токены живут 7 дней. Если токен украден, злоумышленник имеет доступ на всю неделю.

**Решение:**

```typescript
// backend-vercel/api/lib/jwt.ts
export async function generateTokenPair(user: User) {
  const accessToken = await new jose.SignJWT({ 
    id: user.id, 
    email: user.email, 
    isAdmin: user.is_admin 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m') // Короткий срок жизни
    .sign(secretKey);
    
  const refreshToken = await new jose.SignJWT({ 
    id: user.id,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
    
  return { accessToken, refreshToken };
}
```

**Изменения в БД:**

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked BOOLEAN DEFAULT false
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

**Новые эндпоинты:**

- `POST /auth/refresh` - Обновление access token
- `POST /auth/logout` - Отзыв refresh token

---

### 3. Логирование изменений прав пользователей

**Реализация:**

```typescript
// backend-vercel/api/lib/auditLog.ts
import { getDb } from './db';
import { logger } from './logger';

export async function logSecurityEvent(
  eventType: 'role_change' | 'admin_access' | 'suspicious_activity',
  userId: number,
  details: Record<string, any>,
  ip: string
) {
  const sql = getDb();
  
  await sql`
    INSERT INTO security_audit_log (event_type, user_id, details, ip_address)
    VALUES (${eventType}, ${userId}, ${JSON.stringify(details)}, ${ip})
  `;
  
  logger.warn('Security event', { eventType, userId, details, ip });
}
```

**Изменения в БД:**

```sql
CREATE TABLE security_audit_log (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON security_audit_log(user_id);
CREATE INDEX idx_audit_log_type ON security_audit_log(event_type);
CREATE INDEX idx_audit_log_created ON security_audit_log(created_at);
```

---

## Приоритет: СРЕДНИЙ

### 4. Динамическая CAPTCHA

**Текущее состояние:** Turnstile проверяется при каждом входе

**Улучшение:** Показывать CAPTCHA только после 3 неудачных попыток

```typescript
// backend-vercel/api/routes/auth.ts
router.post('/login', authLimiter, async (req, res) => {
  // ... существующий код ...
  
  const failedAttempts = dbUser.failed_login_attempts || 0;
  
  // Требуем CAPTCHA после 3 попыток
  if (failedAttempts >= 3) {
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!isTurnstileValid) {
      return res.json({ 
        success: false, 
        message: 'Проверка безопасности не пройдена',
        requiresCaptcha: true 
      });
    }
  }
  
  // ... остальной код ...
});
```

---

### 5. Мониторинг подозрительной активности

**Признаки подозрительной активности:**
- Вход с нового IP адреса
- Вход в необычное время (ночью для пользователя из другого часового пояса)
- Множественные неудачные попытки входа
- Быстрая смена IP адресов

**Реализация:**

```typescript
// backend-vercel/api/lib/suspiciousActivity.ts
export async function checkSuspiciousActivity(
  userId: number, 
  ip: string
): Promise<{ suspicious: boolean; reason?: string }> {
  const sql = getDb();
  
  // Проверяем последние входы
  const recentLogins = await sql`
    SELECT ip_address, created_at 
    FROM login_history 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 10
  `;
  
  // Новый IP?
  const knownIPs = recentLogins.map(l => l.ip_address);
  if (!knownIPs.includes(ip)) {
    return { suspicious: true, reason: 'new_ip' };
  }
  
  // Множественные IP за короткое время?
  const recentIPs = new Set(recentLogins.slice(0, 5).map(l => l.ip_address));
  if (recentIPs.size > 3) {
    return { suspicious: true, reason: 'multiple_ips' };
  }
  
  return { suspicious: false };
}
```

**Изменения в БД:**

```sql
CREATE TABLE login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_created ON login_history(created_at);
```

---

### 6. Email уведомления о входе

**Когда отправлять:**
- Вход с нового устройства/IP
- Изменение пароля
- Изменение email
- Включение/отключение 2FA

```typescript
// backend-vercel/api/lib/email.ts
export async function sendLoginNotification(
  email: string,
  username: string,
  ip: string,
  userAgent: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'security@booleanclient.ru',
    to: email,
    subject: 'Новый вход в аккаунт Boolean Client',
    html: `
      <h2>Обнаружен вход в ваш аккаунт</h2>
      <p>Здравствуйте, ${username}!</p>
      <p>Мы обнаружили вход в ваш аккаунт с нового устройства:</p>
      <ul>
        <li><strong>IP адрес:</strong> ${ip}</li>
        <li><strong>Устройство:</strong> ${userAgent}</li>
        <li><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</li>
      </ul>
      <p>Если это были не вы, немедленно смените пароль и свяжитесь с поддержкой.</p>
    `
  });
}
```

---

## Приоритет: НИЗКИЙ

### 7. Ротация JWT секретов

**Проблема:** JWT_SECRET никогда не меняется

**Решение:** Поддержка нескольких секретов одновременно

```typescript
// backend-vercel/api/lib/jwt.ts
const secrets = [
  process.env.JWT_SECRET_CURRENT,
  process.env.JWT_SECRET_PREVIOUS, // Для плавной миграции
];

export async function verifyToken(token: string) {
  for (const secret of secrets) {
    try {
      const secretKey = encoder.encode(secret);
      const { payload } = await jose.jwtVerify(token, secretKey);
      return payload;
    } catch {
      continue;
    }
  }
  return null;
}
```

---

### 8. Honeypot поля в формах

**Защита от ботов:**

```typescript
// Добавить скрытое поле в форму регистрации
<input 
  type="text" 
  name="website" 
  style={{ display: 'none' }} 
  tabIndex={-1}
  autoComplete="off"
/>

// На сервере
router.post('/register', async (req, res) => {
  // Если honeypot заполнен - это бот
  if (req.body.website) {
    return res.json({ success: false, message: 'Ошибка регистрации' });
  }
  // ... остальной код ...
});
```

---

### 9. Геолокация и блокировка по странам

**Если нужно ограничить доступ:**

```typescript
// backend-vercel/api/lib/geoblock.ts
import { geolocation } from '@vercel/edge';

export function checkGeoblock(request: Request): boolean {
  const geo = geolocation(request);
  
  // Блокируем определенные страны
  const blockedCountries = ['XX', 'YY'];
  
  if (geo.country && blockedCountries.includes(geo.country)) {
    return false;
  }
  
  return true;
}
```

---

## Инструменты для мониторинга

### Рекомендуемые сервисы:

1. **Sentry** - Мониторинг ошибок и производительности
2. **LogRocket** - Session replay для отладки
3. **Datadog** - Мониторинг инфраструктуры
4. **Cloudflare Analytics** - Анализ трафика и атак

### Алерты:

- Более 10 неудачных попыток входа за минуту
- Блокировка более 5 аккаунтов за час
- Необычный всплеск трафика
- Ошибки базы данных
- Недоступность внешних сервисов (Resend, Upstash)

---

## Регулярные проверки безопасности

### Еженедельно:
- [ ] Проверка логов на подозрительную активность
- [ ] Мониторинг заблокированных аккаунтов

### Ежемесячно:
- [ ] Обновление зависимостей (`npm audit`)
- [ ] Проверка истекающих SSL сертификатов
- [ ] Ревью прав доступа администраторов

### Ежеквартально:
- [ ] Полный аудит безопасности кода
- [ ] Пентест (если возможно)
- [ ] Ротация API ключей
- [ ] Обновление политики безопасности

---

## Полезные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
