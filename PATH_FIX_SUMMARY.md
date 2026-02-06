# Исправление путей в приложении

## Проблема
Приложение запускается через PM2 с `cwd: /var/www/resultMA`, но файлы находятся в `/var/www/resultMA/server/`.

При использовании `process.cwd()` получаем `/var/www/resultMA`, что приводит к неправильным путям:
- ❌ Искало: `/var/www/resultMA/python/omr_color.py`
- ✅ Нужно: `/var/www/resultMA/server/python/omr_color.py`

## Решение
Используем `__dirname` вместо `process.cwd()` для определения базовой директории сервера.

### Как это работает:
- `__dirname` в скомпилированном коде указывает на директорию текущего файла
- Например: `/var/www/resultMA/server/dist/routes/omr.routes.js`
- Поднимаемся на 2 уровня вверх: `path.join(__dirname, '..', '..')`
- Получаем: `/var/www/resultMA/server/`

## Исправленные файлы

### 1. server/src/routes/omr.routes.ts
**Изменения:**
```typescript
// Добавлено в начало файла
const SERVER_ROOT = path.join(__dirname, '..', '..');

// Было:
const uploadDir = path.join(process.cwd(), 'uploads', 'omr');
const qrScriptPath = path.join(process.cwd(), 'server', 'python', 'qr_scanner.py');
const pythonScript = path.join(process.cwd(), 'server', 'python', 'omr_color.py');
const imagePath = path.join(process.cwd(), 'uploads', 'omr', filename);

// Стало:
const uploadDir = path.join(SERVER_ROOT, 'uploads', 'omr');
const qrScriptPath = path.join(SERVER_ROOT, 'python', 'qr_scanner.py');
const pythonScript = path.join(SERVER_ROOT, 'python', 'omr_color.py');
const imagePath = path.join(SERVER_ROOT, 'uploads', 'omr', filename);
```

### 2. server/src/index.ts
**Изменения:**
```typescript
// Добавлено
const SERVER_ROOT = path.join(__dirname, '..');

// Было:
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Стало:
app.use('/uploads', express.static(path.join(SERVER_ROOT, 'uploads')));
```

### 3. server/src/services/omrQueueHandler.ts
**Изменения:**
```typescript
// Добавлено в начало
const SERVER_ROOT = path.join(__dirname, '..', '..');

// Было:
const pythonScript = path.join(process.cwd(), 'server', 'python', 'omr_final_v2.py');

// Стало:
const pythonScript = path.join(SERVER_ROOT, 'python', 'omr_final_v2.py');
```

### 4. server/src/routes/upload.routes.ts
**Изменения:**
```typescript
// Добавлено
const SERVER_ROOT = path.join(__dirname, '..', '..');

// Было:
const uploadDir = path.join(process.cwd(), 'uploads');

// Стало:
const uploadDir = path.join(SERVER_ROOT, 'uploads');
```

### 5. server/src/routes/test.routes.ts
**Изменения:**
```typescript
// Добавлено
const SERVER_ROOT = path.join(__dirname, '..', '..');

// Было:
const uploadDir = path.join(process.cwd(), 'uploads');
const absolutePath = path.join(process.cwd(), req.file.path);

// Стало:
const uploadDir = path.join(SERVER_ROOT, 'uploads');
const absolutePath = path.join(SERVER_ROOT, req.file.path);
```

### 6. server/src/scripts/generateExcelTemplate.ts
**Изменения:**
```typescript
// Добавлено
const SERVER_ROOT = path.join(__dirname, '..', '..');

// Было:
const outputPath = path.join(process.cwd(), 'uploads', 'student_import_template_example.xlsx');

// Стало:
const outputPath = path.join(SERVER_ROOT, 'uploads', 'student_import_template_example.xlsx');
```

## Результат
Теперь все пути правильно указывают на:
- ✅ `/var/www/resultMA/server/python/omr_color.py`
- ✅ `/var/www/resultMA/server/python/qr_scanner.py`
- ✅ `/var/www/resultMA/server/uploads/omr/`

## Следующие шаги
1. Перекомпилировать TypeScript: `cd server && npm run build`
2. Перезапустить PM2: `pm2 restart all`
3. Проверить логи: `pm2 logs`
4. Протестировать загрузку и проверку OMR

## Проверка
После деплоя проверьте в логах:
```
✅ Python script path: /var/www/resultMA/server/python/omr_color.py
✅ Upload directory ready: /var/www/resultMA/server/uploads/omr
```
