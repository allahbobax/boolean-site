# Сводка исправлений безопасности - 2026-01-08

## ✅ Выполненные исправления

### 🔴 КРИТИЧЕСКИЕ (6 исправлений)

#### 1. Удален небезопасный localStorage fallback
- **Файл:** `src/utils/database.ts`
- **Что исправлено:**
  - Удален fallback на localStorage с `btoa()` хешированием
  - Аутентификация теперь возможна только через API
  - Регистрация только через API
  - Админ-вход только через API

#### 2. CSRF защита для всех роутов
- **Файл:** `backend-vercel/api/index.ts`
- **Что исправлено:**
  - Добавлен `csrfProtection` для: `/keys`, `/incidents`, `/versions`, `/products`, `/friends`, `/client`
  - Только `/status` и `/oauth` остались без CSRF (по дизайну)

#### 3. Валидация URL
- **Файл:** `backend-vercel/api/routes/versions.ts`
- **Что исправлено:**
  - Проверка протокола (только HTTPS)
  - Whitelist доменов: `booleanclient.ru`, `github.com`, `cdn.booleanclient.ru`
  - Валидация формата URL

#### 4. Защита от brute force
- **Файлы:** 
  - `backend-vercel/api/routes/auth.ts`
  - `backend-vercel/api/lib/db.ts`
- **Что исправлено:**
  - Блокировка аккаунта на 30 минут после 5 неудачных попыток
  - Новые поля в БД: `failed_login_attempts`, `account_locked_until`, `last_failed_login`
  - Логирование всех попыток входа
  - Информирование пользователя об оставшихся попытках

#### 5. Проверка OAuth провайдеров
- **Файл:** `backend-vercel/api/routes/oauth.ts`
- **Что исправлено:**
  - Проверка наличия credentials перед обработкой OAuth
  - Возврат 503 если провайдер не настроен

#### 6. Ужесточена CSP
- **Файл:** `backend-vercel/api/index.ts`
- **Что исправлено:**
  - Удален `unsafe-inline`
  - Ограничены домены для изображений
  - Добавлены: `connectSrc`, `fontSrc`, `objectSrc`, `mediaSrc`, `frameSrc`

---

## 📊 Статистика

- **Файлов изменено:** 6
- **Критических уязвимостей исправлено:** 6
- **Новых полей в БД:** 3
- **Строк кода добавлено:** ~150
- **Строк кода удалено:** ~50

---

## 🔍 Изменения в базе данных

### Новые поля в таблице `users`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE;
```

**Миграция:** Выполняется автоматически при первом запуске через `ensureUserSchema()`

---

## 🚀 Что нужно сделать перед деплоем

### 1. Проверить переменные окружения

```bash
# Обязательные
✅ DATABASE_URL
✅ JWT_SECRET (минимум 32 символа)
✅ UPSTASH_REDIS_REST_URL
✅ UPSTASH_REDIS_REST_TOKEN
✅ RESEND_API_KEY
✅ TURNSTILE_SECRET_KEY
✅ ADMIN_API_KEY

# Опциональные (для OAuth)
⚠️ GITHUB_CLIENT_ID
⚠️ GITHUB_CLIENT_SECRET
⚠️ GOOGLE_CLIENT_ID
⚠️ GOOGLE_CLIENT_SECRET
⚠️ YANDEX_CLIENT_ID
⚠️ YANDEX_CLIENT_SECRET
```

### 2. Тестирование после деплоя

```bash
# 1. Проверить вход
curl -X POST https://api.booleanclient.ru/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"test","password":"test123"}'

# 2. Проверить блокировку (5 неудачных попыток)
for i in {1..6}; do
  curl -X POST https://api.booleanclient.ru/auth/login \
    -H "Content-Type: application/json" \
    -d '{"usernameOrEmail":"test","password":"wrong"}'
done

# 3. Проверить CSRF
curl -X POST https://api.booleanclient.ru/versions \
  -H "Content-Type: application/json" \
  -d '{"version":"1.0.0","downloadUrl":"https://test.com/file.zip"}'
# Должен вернуть ошибку CSRF

# 4. Проверить валидацию URL
curl -X POST https://api.booleanclient.ru/versions \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"version":"1.0.0","downloadUrl":"http://malicious.com/file.zip"}'
# Должен вернуть ошибку валидации
```

### 3. Мониторинг

После деплоя следите за:
- Логами ошибок
- Количеством заблокированных аккаунтов
- Rate limiting срабатываниями
- CSRF ошибками

---

## 📝 Документация

Создано 3 файла документации:

1. **SECURITY.md** - Основная политика безопасности
2. **SECURITY_RECOMMENDATIONS.md** - Рекомендации для будущих улучшений
3. **SECURITY_FIXES_SUMMARY.md** - Эта сводка

---

## 🎯 Следующие шаги (рекомендуется)

### Высокий приоритет:
1. ⚠️ Реализовать 2FA для администраторов
2. ⚠️ Добавить refresh tokens (короткий срок жизни access tokens)
3. ⚠️ Расширить логирование безопасности

### Средний приоритет:
4. ⚠️ Динамическая CAPTCHA (после 3 попыток)
5. ⚠️ Мониторинг подозрительной активности
6. ⚠️ Email уведомления о входе с нового устройства

Подробности в `SECURITY_RECOMMENDATIONS.md`

---

## ✅ Чеклист перед коммитом

- [x] Все файлы без синтаксических ошибок
- [x] Документация обновлена
- [x] Изменения в БД документированы
- [x] Обратная совместимость сохранена
- [ ] Код протестирован локально
- [ ] Переменные окружения проверены
- [ ] Готов к деплою

---

## 📞 Контакты

При вопросах по исправлениям: security@booleanclient.ru
