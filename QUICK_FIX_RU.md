# Быстрое исправление ошибки загрузки OMR

## Что случилось?
При загрузке OMR файлов возникает ошибка:
```
ENOENT: no such file or directory, open '/var/www/resultMA/uploads/omr/...'
```

## Почему?
Директория `uploads/omr` не создавалась автоматически.

## Как исправить?

### Вариант 1: Быстрое временное решение (1 минута)

На сервере выполните:
```bash
cd /var/www/resultMA
mkdir -p uploads/omr
chmod 755 uploads/omr
pm2 restart mathacademy-server
```

### Вариант 2: Полное исправление с деплоем (5 минут)

На сервере выполните:
```bash
cd /var/www/resultMA
chmod +x deploy-fix.sh
./deploy-fix.sh
```

Или вручную:
```bash
cd /var/www/resultMA
git pull
cd server
npm run build
pm2 restart mathacademy-server
pm2 logs mathacademy-server --lines 20
```

## Что было исправлено в коде?

1. **server/src/routes/omr.routes.ts** - добавлено автоматическое создание директории `uploads/omr`
2. **server/src/routes/test.routes.ts** - добавлена проверка существования директории `uploads`

Теперь директории будут создаваться автоматически при запуске сервера.

## Проверка

После исправления в логах должно появиться:
```
✅ Upload directory ready: /var/www/resultMA/uploads/omr
```

Попробуйте загрузить OMR файл - ошибка должна исчезнуть.
