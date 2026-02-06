#!/bin/bash

# Скрипт для деплоя исправлений путей
# Использование: bash deploy-path-fix.sh

echo "🚀 Начинаем деплой исправлений путей..."

# Переходим в директорию сервера
cd server || exit 1

echo "📦 Устанавливаем зависимости..."
npm install

echo "🔨 Компилируем TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка компиляции TypeScript"
    exit 1
fi

echo "✅ Компиляция успешна"

# Проверяем что скомпилированные файлы существуют
if [ ! -f "dist/index.js" ]; then
    echo "❌ Файл dist/index.js не найден"
    exit 1
fi

if [ ! -f "dist/routes/omr.routes.js" ]; then
    echo "❌ Файл dist/routes/omr.routes.js не найден"
    exit 1
fi

echo "✅ Все файлы скомпилированы"

# Проверяем что Python скрипты существуют
if [ ! -f "python/omr_color.py" ]; then
    echo "❌ Python скрипт python/omr_color.py не найден"
    exit 1
fi

if [ ! -f "python/qr_scanner.py" ]; then
    echo "❌ Python скрипт python/qr_scanner.py не найден"
    exit 1
fi

echo "✅ Python скрипты найдены"

# Проверяем что директория uploads существует
if [ ! -d "uploads/omr" ]; then
    echo "📁 Создаем директорию uploads/omr..."
    mkdir -p uploads/omr
fi

echo "✅ Директория uploads/omr готова"

# Перезапускаем PM2
echo "🔄 Перезапускаем PM2..."
cd ..
pm2 restart all

if [ $? -ne 0 ]; then
    echo "❌ Ошибка перезапуска PM2"
    exit 1
fi

echo "✅ PM2 перезапущен"

# Ждем 3 секунды для запуска
sleep 3

# Показываем логи
echo ""
echo "📋 Последние логи PM2:"
pm2 logs --lines 20 --nostream

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "🔍 Проверьте логи на наличие правильных путей:"
echo "   - Python script path: /var/www/resultMA/server/python/omr_color.py"
echo "   - Upload directory: /var/www/resultMA/server/uploads/omr"
echo ""
echo "📝 Для просмотра логов в реальном времени:"
echo "   pm2 logs"
