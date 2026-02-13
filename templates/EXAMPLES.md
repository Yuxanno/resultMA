# 📚 Примеры использования Templates

Реальные примеры использования шаблонов для проекта ResultMA.

---

## Пример 1: Новая фича - Test Analytics Dashboard

### Запрос пользователя:
```
Хочу добавить дашборд с аналитикой по тестам.
Учитель должен видеть:
- Средний балл по тесту
- Распределение оценок (гистограмма)
- Самые сложные вопросы
- Динамику результатов по времени
```

### Промпт для AI:
```
Используй templates/new-feature.md

Задача: Добавить Test Analytics Dashboard

Требования:
- Учитель видит статистику по своим тестам
- Графики: средний балл, распределение, сложные вопросы
- Динамика по времени
- Экспорт в Excel

Заполни template детально, задавай уточняющие вопросы.
```

### Что AI сделает:

1. **Задаст уточняющие вопросы:**
   - Какие графики использовать? (Chart.js, Recharts, D3?)
   - Какой период времени показывать? (неделя, месяц, год?)
   - Нужна ли фильтрация по группам?
   - Нужны ли уведомления о низких результатах?

2. **Заполнит template:**
   - User stories для учителя
   - Technical breakdown (frontend + backend)
   - API endpoints для статистики
   - Database aggregation queries
   - UI mockups (ASCII art)
   - Testing strategy

3. **Предложит решение:**
   - Использовать Recharts (уже в проекте)
   - MongoDB aggregation для статистики
   - Кэширование результатов (5 минут TTL)
   - Pagination для больших данных

---

## Пример 2: Баг - Формулы отображаются как [object Object]

### Запрос пользователя:
```
Баг: После импорта теста из Word формулы показываются как [object Object]

Шаги:
1. Импортирую тест с формулами из Word
2. Открываю тест в редакторе
3. Вижу [object Object] вместо формул
```

### Промпт для AI:
```
Используй templates/bug-fix.md

Баг: Формулы отображаются как [object Object]

Проанализируй проблему, найди root cause, предложи решение.
```

### Что AI сделает:

1. **Проанализирует код:**
   - Прочитает `server/src/services/wordParser.ts`
   - Прочитает `client/src/lib/ommlUtils.ts`
   - Прочитает `client/src/components/editor/FormulaNode.tsx`

2. **Найдет root cause:**
   ```typescript
   // Проблема в ommlUtils.ts
   export function ommlToMathML(omml: string): string {
     const ommlObj = JSON.parse(omml);
     return convertOmmlObject(ommlObj); // Возвращает object вместо string
   }
   ```

3. **Предложит решение:**
   ```typescript
   // Исправление
   export function ommlToMathML(omml: string): string {
     try {
       const ommlObj = JSON.parse(omml);
       const mathml = convertOmmlObject(ommlObj);
       return typeof mathml === 'string' ? mathml : JSON.stringify(mathml);
     } catch (error) {
       console.error('❌ OMML conversion error:', error);
       return omml; // Fallback to original
     }
   }
   ```

4. **Добавит тесты:**
   ```typescript
   describe('ommlToMathML', () => {
     it('should convert OMML to MathML string', () => {
       const omml = '{"m:r": {"m:t": "x"}}';
       const result = ommlToMathML(omml);
       expect(typeof result).toBe('string');
       expect(result).toContain('<mi>x</mi>');
     });
   });
   ```

---

## Пример 3: Рефакторинг - testImportService.ts

### Запрос пользователя:
```
Файл testImportService.ts слишком большой (800+ строк).
Нужно отрефакторить, разбить на модули.
```

### Промпт для AI:
```
Используй templates/refactoring.md

Файл: server/src/services/testImportService.ts (800+ строк)

Проанализируй код, найди code smells, предложи план рефакторинга.
```

### Что AI сделает:

1. **Найдет code smells:**
   - Long Method: `importTest()` - 200 строк
   - Duplicated Code: парсинг Word и PDF похож
   - Large Class: слишком много ответственностей
   - Magic Numbers: хардкод таймаутов и лимитов

2. **Предложит структуру:**
   ```
   services/
   ├── testImport/
   │   ├── index.ts              # Main service
   │   ├── parsers/
   │   │   ├── wordParser.ts     # Word parsing
   │   │   ├── pdfParser.ts      # PDF parsing
   │   │   └── imageParser.ts    # Image OCR
   │   ├── validators/
   │   │   └── testValidator.ts  # Validation logic
   │   └── converters/
   │       └── formatConverter.ts # Format conversion
   ```

3. **Создаст план:**
   - Step 1: Extract Word parser (2 hours)
   - Step 2: Extract PDF parser (2 hours)
   - Step 3: Extract Image parser (2 hours)
   - Step 4: Extract validator (1 hour)
   - Step 5: Refactor main service (3 hours)
   - Step 6: Add tests (2 hours)

4. **Покажет Before/After:**
   ```typescript
   // Before (800 строк в одном файле)
   class TestImportService {
     async importTest() {
       // 200 строк логики
     }
   }

   // After (модульная структура)
   class TestImportService {
     constructor(
       private wordParser: WordParser,
       private pdfParser: PdfParser,
       private validator: TestValidator
     ) {}

     async importTest(file: File) {
       const parser = this.getParser(file.type);
       const data = await parser.parse(file);
       await this.validator.validate(data);
       return this.save(data);
     }
   }
   ```

---

## Пример 4: Code Review - PR #123 "Add Email Notifications"

### Запрос пользователя:
```
Проведи code review для PR #123

Изменения:
- Добавлена интеграция с Resend API
- Email уведомления при сдаче теста
- Настройки уведомлений в профиле
```

### Промпт для AI:
```
Используй templates/code-review.md

PR #123: Add Email Notifications

Файлы:
- server/src/services/emailService.ts (new)
- server/src/routes/notification.routes.ts (new)
- server/src/models/User.ts (modified)
- client/src/pages/teacher/SettingsPage.tsx (modified)

Проведи детальный review.
```

### Что AI сделает:

1. **Проверит функциональность:**
   - ✅ Email отправляется корректно
   - ✅ Настройки сохраняются
   - ❌ Нет обработки ошибок Resend API

2. **Проверит безопасность:**
   - ✅ API key в .env
   - ✅ Email validation
   - ❌ Нет rate limiting (можно спамить)
   - ❌ Email в логах (PII leak)

3. **Проверит производительность:**
   - ❌ Email отправляется синхронно (блокирует запрос)
   - 💡 Suggestion: использовать Bull queue

4. **Предложит улучшения:**
   ```typescript
   // Current (blocking)
   await emailService.send(email);
   res.json({ success: true });

   // Suggested (async)
   await emailQueue.add('send-email', { email });
   res.json({ success: true, queued: true });
   ```

5. **Даст вердикт:**
   - 🔄 Request Changes
   - Must fix: Rate limiting, async sending, error handling
   - Nice to have: Email templates, retry logic

---

## Пример 5: Architecture Decision - Кэширование

### Запрос пользователя:
```
Нужно решить: как кэшировать результаты тестов?

Варианты:
1. Redis (текущий)
2. In-memory (Node.js)
3. MongoDB TTL indexes

Требования:
- Быстрый доступ
- Автоматическая инвалидация
- Масштабируемость
```

### Промпт для AI:
```
Используй templates/architecture-decision.md

Решение: Стратегия кэширования результатов тестов

Проанализируй варианты, используй chain-of-thought reasoning.
```

### Что AI сделает:

1. **Проанализирует каждый вариант:**

   **Option 1: Redis**
   - ✅ Очень быстрый (in-memory)
   - ✅ TTL из коробки
   - ✅ Масштабируется (Redis Cluster)
   - ❌ Дополнительный сервис
   - ❌ Стоимость (Redis Cloud)

   **Option 2: In-memory (Node.js)**
   - ✅ Нет дополнительных зависимостей
   - ✅ Очень быстрый
   - ❌ Не масштабируется (один процесс)
   - ❌ Теряется при рестарте
   - ❌ Ограничен RAM сервера

   **Option 3: MongoDB TTL**
   - ✅ Уже используем MongoDB
   - ✅ TTL indexes
   - ❌ Медленнее чем in-memory
   - ❌ Нагрузка на основную DB

2. **Создаст comparison matrix:**

   | Criteria | Weight | Redis | In-memory | MongoDB |
   |----------|--------|-------|-----------|---------|
   | Speed | 10 | 10 | 10 | 6 |
   | Scalability | 9 | 10 | 3 | 7 |
   | Cost | 7 | 6 | 10 | 9 |
   | Complexity | 6 | 7 | 10 | 8 |
   | **Total** | - | **8.5** | **7.8** | **7.3** |

3. **Даст рекомендацию:**
   - **Chosen: Redis**
   - Rationale: Лучший баланс скорости и масштабируемости
   - Trade-off: Дополнительная сложность, но окупается

4. **Создаст implementation plan:**
   - Phase 1: Setup Redis (1 day)
   - Phase 2: Implement caching layer (2 days)
   - Phase 3: Add monitoring (1 day)
   - Phase 4: Load testing (1 day)

---

## Пример 6: Комбинация шаблонов

### Запрос пользователя:
```
Хочу добавить фичу "Real-time Collaboration" для редактирования тестов.
Несколько учителей могут редактировать тест одновременно.

Это сложная фича, нужно:
1. Выбрать технологию (WebSockets vs Server-Sent Events)
2. Спроектировать архитектуру
3. Спланировать разработку
```

### Промпт для AI:
```
Используй templates/architecture-decision.md + templates/new-feature.md

Задача: Real-time Collaboration для редактирования тестов

Сначала проанализируй архитектурные варианты (ADR),
потом создай детальный план фичи (New Feature).
```

### Что AI сделает:

1. **Сначала ADR (architecture-decision.md):**
   - Проанализирует WebSockets vs SSE vs Long Polling
   - Создаст comparison matrix
   - Выберет WebSockets (Socket.io)
   - Обоснует выбор

2. **Потом New Feature (new-feature.md):**
   - User stories для collaboration
   - Technical breakdown:
     - Frontend: Socket.io client, conflict resolution
     - Backend: Socket.io server, room management
     - Database: Operational Transform или CRDT
   - API specification для WebSocket events
   - Security considerations (auth для WebSockets)
   - Testing strategy (unit + integration + E2E)

3. **Результат:**
   - Полный ADR документ с обоснованием
   - Полный Feature spec с планом
   - Готово к разработке!

---

## Советы по использованию

### 1. Начинай с простого
Не нужно заполнять ВСЕ секции сразу. Начни с основных:
- Problem Statement
- Solution
- Implementation Plan

### 2. Итеративно уточняй
```
User: Используй new-feature.md для Analytics Dashboard
AI: [заполняет template]
User: А как насчет экспорта в PDF?
AI: [дополняет template]
```

### 3. Комбинируй шаблоны
Для сложных задач используй несколько шаблонов:
- ADR + New Feature (архитектура + план)
- Bug Fix + Refactoring (исправление + улучшение)
- Code Review + Refactoring (review выявил проблемы)

### 4. Сохраняй результаты
Создай папки для документации:
```
docs/
├── decisions/        # ADR документы
├── features/         # Feature specs
├── reviews/          # Code reviews
└── refactorings/     # Refactoring plans
```

### 5. Обновляй шаблоны
Если шаблон не покрывает твой случай - обнови его!

---

**Последнее обновление:** 2025-02-12  
**Версия:** 1.0.0