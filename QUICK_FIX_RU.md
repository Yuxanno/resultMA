# Быстрое исправление ошибок загрузки OMR

## Что случилось?

### Ошибка 1: Директория не найдена
```
ENOENT: no such file or directory, open '/var/www/resultMA/uploads/omr/...'
```

### Ошибка 2: Python скрипты не найдены
```
Python script not found: /var/www/resultMA/python/omr_color.py
Python script not found: /var/www/resultMA/python/qr_scanner.py
```

### Ошибка 3: Обработанное изображение не отображается
Клиент получает только имя файла `checked_omr-....png` без полного пути для доступа.

## Почему?
1. Директория `uploads/omr` не создавалась автоматически
2. Python скрипты искались в `/var/www/resultMA/python/` вместо `/var/www/resultMA/server/python/`
3. Сервер не возвращал полный URL для обработанного изображения

## Как исправить?

### ⚠️ ВАЖНО: Только деплой полностью решит все проблемы!

### Полное исправление с деплоем (5 минут) ✅ РЕКОМЕНДУЕТСЯ

На сервере выполните:
```bash
cd /var/www/resultMA
git pull
cd server
npm run build
cd ..
pm2 restart mathacademy-server
pm2 logs mathacademy-server --lines 30
```

## Что было исправлено в коде?

1. **server/src/routes/omr.routes.ts**
   - Добавлено автоматическое создание директории `uploads/omr`
   - Исправлены пути к Python скриптам: `server/python/qr_scanner.py` и `server/python/omr_color.py`
   - Добавлено поле `annotated_image_url` с полным путем к обработанному изображению

2. **server/src/routes/test.routes.ts**
   - Добавлена проверка существования директории `uploads`

3. **server/src/services/omrQueueHandler.ts**
   - Исправлен путь к Python скрипту: `server/python/omr_final_v2.py`

## Проверка

После деплоя в логах должно появиться:
```
✅ Upload directory ready: /var/www/resultMA/uploads/omr
🔍 QR scanner command: python3 "/var/www/resultMA/server/python/qr_scanner.py" ...
🐍 Python command: python3 "/var/www/resultMA/server/python/omr_color.py" ...
📸 Annotated image URL: /uploads/omr/checked_omr-....png
```

## Использование обработанного изображения на клиенте:

```typescript
// Ответ сервера теперь содержит:
{
  "annotated_image": "checked_omr-1770380430396-272728333.png",
  "annotated_image_url": "/uploads/omr/checked_omr-1770380430396-272728333.png"
}

// Использование:
<img src={result.annotated_image_url} alt="Обработанный OMR лист" />
```

Все три проблемы будут полностью устранены! 🎉
