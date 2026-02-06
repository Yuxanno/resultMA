# Быстрая сводка: Исправление путей

## Проблема
```
❌ Приложение ищет: /var/www/resultMA/python/omr_color.py
✅ Файл находится: /var/www/resultMA/server/python/omr_color.py
```

## Причина
PM2 запускается с `cwd: /var/www/resultMA`, а `process.cwd()` возвращает эту директорию.

## Решение
Заменили `process.cwd()` на `__dirname` с правильным подъемом на уровни вверх.

## Измененные файлы (6 файлов)

1. **server/src/routes/omr.routes.ts** - основной файл с OMR логикой
2. **server/src/index.ts** - статические файлы uploads
3. **server/src/services/omrQueueHandler.ts** - очередь OMR задач
4. **server/src/routes/upload.routes.ts** - загрузка файлов
5. **server/src/routes/test.routes.ts** - импорт тестов
6. **server/src/scripts/generateExcelTemplate.ts** - генерация Excel

## Деплой (3 команды)

```bash
cd /var/www/resultMA/server && npm run build
cd /var/www/resultMA && pm2 restart all
pm2 logs
```

## Проверка

В логах должно быть:
```
✅ Upload directory ready: /var/www/resultMA/server/uploads/omr
✅ Python script exists
```

## Тест

1. Загрузить OMR изображение
2. Проверить что QR-код распознается
3. Проверить что ответы определяются
4. Сохранить результат

Всё должно работать без ошибок `ENOENT` или `File not found`.

---

**Подробности:** см. `PATH_FIX_SUMMARY.md`  
**Инструкция:** см. `ИНСТРУКЦИЯ_ПО_ДЕПЛОЮ.md`  
**Чеклист:** см. `CHECKLIST.md`
