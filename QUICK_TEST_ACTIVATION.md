# Быстрая активация 57 пропущенных тестов

## Почему тесты пропускаются?

57 тестов помечены `.skip` потому что требуют авторизации для доступа к защищенным страницам (Teacher Dashboard, Tests, Students и т.д.)

## Активация за 3 шага

### 1️⃣ Создать тестового пользователя

```bash
cd server
npm run create-test-user
```

Будет создан:
- Login: `test@teacher.com`
- Password: `Test123!@#`

### 2️⃣ Убрать .skip из тестов

**Вариант A: Автоматически (все файлы)**

```bash
cd client/e2e

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter "*.spec.ts" | ForEach-Object { (Get-Content $_.FullName) -replace 'test\.skip', 'test' | Set-Content $_.FullName }

# Linux/Mac
find . -name "*.spec.ts" -exec sed -i 's/test\.skip/test/g' {} \;
```

**Вариант B: Вручную (по одному файлу)**

Откройте файлы и замените `test.skip` на `test`:
- `teacher-dashboard.spec.ts`
- `test-creation.spec.ts`
- `student-management.spec.ts`
- `assignments.spec.ts`
- `omr-checker.spec.ts`
- `rich-text-editor.spec.ts`
- `public-pages.spec.ts`
- `performance.spec.ts`

### 3️⃣ Запустить тесты

```bash
cd client
npm run test:e2e
```

## Результат

**До активации:**
```
Running 82 tests using 6 workers
57 skipped
25 passed (18.2s)
```

**После активации:**
```
Running 82 tests using 6 workers
0 skipped
~75-80 passed (60-90s)
```

## Проверка

Если тесты падают с ошибкой авторизации:

1. Проверьте что пользователь создан:
```bash
cd server
npm run create-test-user
```

2. Попробуйте войти вручную:
- Откройте http://localhost:9998
- Login: `test@teacher.com`
- Password: `Test123!@#`
- Должен открыться Teacher Dashboard

3. Проверьте что серверы запущены:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## Детальная инструкция

Смотрите `client/e2e/ACTIVATION_GUIDE.md` для подробностей.
