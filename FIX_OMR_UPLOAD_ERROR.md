# Исправление ошибки ENOENT при загрузке OMR файлов

## Проблема
```
ENOENT: no such file or directory, open '/var/www/resultMA/uploads/omr/omr-1770379631962-921756680.png'
```

## Причина
Директория `uploads/omr` не создавалась автоматически при загрузке файлов через multer.

## Исправление

Были внесены изменения в следующие файлы:

### 1. `server/src/routes/omr.routes.ts`
Добавлено автоматическое создание директории перед настройкой multer:

```typescript
import fsSync from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads', 'omr');

// Создаем директорию если не существует (синхронно)
try {
  fsSync.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory ready:', uploadDir);
} catch (err) {
  console.error('❌ Failed to create upload directory:', err);
}
```

### 2. `server/src/routes/test.routes.ts`
Добавлена аналогичная проверка для директории uploads:

```typescript
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory ready:', uploadDir);
}
```

## Деплой на сервер

Выполните следующие команды на сервере:

```bash
# 1. Перейдите в директорию проекта
cd /var/www/resultMA

# 2. Обновите код из репозитория
git pull

# 3. Пересоберите TypeScript
cd server
npm run build

# 4. Перезапустите сервер через PM2
pm2 restart mathacademy-server

# 5. Проверьте логи
pm2 logs mathacademy-server --lines 50
```

## Альтернативное решение (если не хотите деплоить сейчас)

Можно вручную создать директорию на сервере:

```bash
cd /var/www/resultMA
mkdir -p uploads/omr
chmod 755 uploads/omr
```

Это временно решит проблему, но после деплоя кода директория будет создаваться автоматически.

## Проверка

После деплоя попробуйте загрузить OMR файл. В логах должно появиться:
```
✅ Upload directory ready: /var/www/resultMA/uploads/omr
```

И ошибка ENOENT больше не должна возникать.
