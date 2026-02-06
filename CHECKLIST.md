# Чеклист деплоя исправлений путей

## Перед деплоем

- [ ] Сделан бэкап базы данных
- [ ] Сделан бэкап текущего кода (`git commit` или копия папки)
- [ ] Проверено что все изменения закоммичены в git
- [ ] Проверено что на сервере установлен Node.js и npm
- [ ] Проверено что PM2 запущен и работает

## Деплой

- [ ] Загружены все измененные файлы на сервер
- [ ] Выполнена команда `cd /var/www/resultMA/server`
- [ ] Выполнена команда `npm install` (если были изменения в package.json)
- [ ] Выполнена команда `npm run build`
- [ ] Компиляция прошла без ошибок
- [ ] Проверено что файлы в `dist/` обновились (проверить дату изменения)
- [ ] Выполнена команда `pm2 restart all`
- [ ] PM2 перезапустился без ошибок

## Проверка после деплоя

### 1. Проверка логов PM2

```bash
pm2 logs --lines 50
```

Должны быть строки:
- [ ] `✅ Upload directory ready: /var/www/resultMA/server/uploads/omr`
- [ ] `✅ Python script exists`
- [ ] Нет ошибок типа `ENOENT` или `File not found`

### 2. Проверка путей к файлам

```bash
# Проверить что Python скрипты существуют
ls -la /var/www/resultMA/server/python/omr_color.py
ls -la /var/www/resultMA/server/python/qr_scanner.py

# Проверить что директория uploads существует
ls -la /var/www/resultMA/server/uploads/omr/
```

Все файлы должны существовать:
- [ ] `omr_color.py` существует
- [ ] `qr_scanner.py` существует
- [ ] Директория `uploads/omr/` существует и доступна для записи

### 3. Функциональное тестирование

#### Тест 1: Загрузка изображения
- [ ] Открыть приложение в браузере
- [ ] Перейти в раздел OMR Checker
- [ ] Загрузить тестовое изображение
- [ ] Изображение загружается без ошибок
- [ ] В логах нет ошибок `ENOENT`

#### Тест 2: Распознавание QR-кода
- [ ] Загрузить изображение с QR-кодом
- [ ] QR-код распознается корректно
- [ ] Отображается информация о студенте
- [ ] В логах: `✅ QR-kod topildi`

#### Тест 3: Распознавание ответов
- [ ] Загрузить изображение ответного листа
- [ ] Ответы распознаются корректно
- [ ] Отображается таблица с результатами
- [ ] В логах: `✅ Tahlil tugadi`

#### Тест 4: Сохранение результатов
- [ ] Нажать кнопку "Сохранить результат"
- [ ] Результат сохраняется в базу данных
- [ ] Обработанное изображение доступно по URL
- [ ] В логах: `✅ Natija saqlandi`

### 4. Проверка статических файлов

```bash
# Проверить что статические файлы доступны
curl http://localhost:5000/uploads/omr/test.png
```

- [ ] Статические файлы доступны через `/uploads/omr/`
- [ ] Нет ошибок 404 или 403

## Если тесты не прошли

### Ошибка: Python script not found

```bash
# Проверить путь к Python скрипту
ls -la /var/www/resultMA/server/python/

# Если файлов нет, проверить что они есть в репозитории
cd /var/www/resultMA
git status
git pull
```

### Ошибка: Upload directory not found

```bash
# Создать директорию вручную
mkdir -p /var/www/resultMA/server/uploads/omr
chmod 755 /var/www/resultMA/server/uploads/omr
chown -R $USER:$USER /var/www/resultMA/server/uploads
```

### Ошибка: Cannot find module

```bash
# Переустановить зависимости
cd /var/www/resultMA/server
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart all
```

### Ошибка: Python dependencies missing

```bash
# Установить Python зависимости
cd /var/www/resultMA/server/python
pip3 install -r requirements.txt
```

## Откат (если что-то пошло не так)

```bash
# 1. Откатить изменения в git
cd /var/www/resultMA
git log --oneline -5
git reset --hard <commit-hash>

# 2. Перекомпилировать
cd server
npm run build

# 3. Перезапустить PM2
cd ..
pm2 restart all

# 4. Проверить логи
pm2 logs
```

## Финальная проверка

- [ ] Все тесты пройдены успешно
- [ ] Нет ошибок в логах PM2
- [ ] Приложение работает стабильно
- [ ] Пользователи могут загружать и проверять OMR листы
- [ ] Результаты сохраняются корректно

## Документация

- [ ] Обновлена документация (если нужно)
- [ ] Команда уведомлена об изменениях
- [ ] Создан git tag для этой версии (опционально)

```bash
git tag -a v1.0.1-path-fix -m "Fixed paths for Python scripts and uploads"
git push origin v1.0.1-path-fix
```

---

**Дата деплоя:** _______________  
**Кто деплоил:** _______________  
**Результат:** ✅ Успешно / ❌ Откачено  
**Комментарии:** _______________
