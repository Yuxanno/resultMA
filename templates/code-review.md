# 👀 Code Review Template

## 1. Review Context

**PR/MR Number:** [#123]

**Title:** [Название PR]

**Author:** [имя автора]

**Reviewer:** [имя reviewer]

**Date:** [YYYY-MM-DD]

**Type:** [Feature/Bug Fix/Refactoring/Documentation]

**Size:** [Small (<100 lines) / Medium (100-500) / Large (>500)]

---

## 2. Summary

### What does this PR do?

[Краткое описание изменений]

### Related Issues

- Closes #[issue number]
- Related to #[issue number]

---

## 3. Code Quality Checklist

### 3.1 Functionality

- [ ] **Code works as intended** - Проверил локально
- [ ] **Edge cases handled** - Обработаны граничные случаи
- [ ] **Error handling** - Ошибки обрабатываются корректно
- [ ] **No breaking changes** - Не ломает существующую функциональность
- [ ] **Backward compatible** - Совместимо с предыдущими версиями (если нужно)

**Comments:**
[Комментарии по функциональности]

---

### 3.2 Code Style & Conventions

- [ ] **Follows project conventions** - Соответствует `AGENTS.md`
- [ ] **Naming is clear** - Понятные имена переменных/функций
- [ ] **TypeScript strict mode** - Нет `any`, правильные типы
- [ ] **No console.logs** - Удалены debug логи (или заменены на logger)
- [ ] **Comments where needed** - Сложная логика прокомментирована
- [ ] **No commented code** - Удален закомментированный код
- [ ] **Formatting consistent** - Prettier/ESLint пройден

**Comments:**
[Комментарии по стилю]

---

### 3.3 Architecture & Design

- [ ] **Follows existing patterns** - Использует паттерны из проекта
- [ ] **Proper separation of concerns** - Логика разделена правильно
- [ ] **DRY principle** - Нет дублирования кода
- [ ] **SOLID principles** - Следует принципам SOLID
- [ ] **Appropriate abstractions** - Уровень абстракции подходящий
- [ ] **No over-engineering** - Не усложнено без необходимости

**Comments:**
[Комментарии по архитектуре]

---

## 4. Security Checklist

- [ ] **Input validation** - Все входные данные валидируются
- [ ] **SQL injection safe** - Нет SQL injection (используем Mongoose)
- [ ] **XSS protection** - Нет XSS уязвимостей
- [ ] **Authentication checked** - Проверяется аутентификация
- [ ] **Authorization checked** - Проверяются права доступа
- [ ] **No sensitive data in logs** - Пароли/токены не логируются
- [ ] **No hardcoded secrets** - Нет хардкод секретов (используем .env)
- [ ] **HTTPS only** - Используется HTTPS (в production)
- [ ] **Rate limiting** - Есть rate limiting (если нужно)

**Security Issues Found:**
[Список найденных проблем безопасности]

---

## 5. Performance Checklist

### Frontend
- [ ] **No unnecessary re-renders** - Оптимизированы ре-рендеры
- [ ] **Lazy loading** - Используется lazy loading (если нужно)
- [ ] **Debounce/throttle** - Используется для частых событий
- [ ] **Optimistic updates** - Используются optimistic updates
- [ ] **No memory leaks** - Нет утечек памяти (cleanup в useEffect)

### Backend
- [ ] **Database queries optimized** - Запросы оптимизированы
- [ ] **Indexes used** - Используются индексы
- [ ] **No N+1 queries** - Нет N+1 проблемы
- [ ] **Pagination** - Используется пагинация для больших списков
- [ ] **Caching** - Используется кэширование (если нужно)
- [ ] **Async operations** - Используется async/await правильно

**Performance Issues Found:**
[Список найденных проблем производительности]

---

## 6. Testing Checklist

- [ ] **Unit tests added** - Добавлены unit тесты
- [ ] **Integration tests added** - Добавлены integration тесты (если нужно)
- [ ] **Tests pass** - Все тесты проходят
- [ ] **Coverage adequate** - Покрытие достаточное (>80%)
- [ ] **Edge cases tested** - Протестированы граничные случаи
- [ ] **Error cases tested** - Протестированы ошибочные сценарии
- [ ] **Manual testing done** - Проведено ручное тестирование

**Test Coverage:**
- Unit: [X%]
- Integration: [Y%]
- Overall: [Z%]

**Comments:**
[Комментарии по тестам]

---

## 7. Documentation Checklist

- [ ] **Code comments** - Сложная логика прокомментирована
- [ ] **JSDoc/TSDoc** - Публичные функции документированы
- [ ] **README updated** - README обновлен (если нужно)
- [ ] **API docs updated** - API документация обновлена (если нужно)
- [ ] **AGENTS.md updated** - AGENTS.md обновлен (если новые паттерны)
- [ ] **Bead created/updated** - Bead в `beads/` обновлен

**Comments:**
[Комментарии по документации]

---

## 8. Detailed Review

### 8.1 What I Like ✅

1. **[Aspect 1]**
   ```typescript
   // Пример хорошего кода
   ```
   [Почему это хорошо]

2. **[Aspect 2]**
   [Описание]

3. **[Aspect 3]**
   [Описание]

---

### 8.2 Suggestions for Improvement 💡

#### Suggestion 1: [Название]

**Location:** `[file]:[line]`

**Current Code:**
```typescript
// Текущий код
```

**Suggested Change:**
```typescript
// Предложенный код
```

**Reason:**
[Почему это улучшение]

**Priority:** [High/Medium/Low]

---

#### Suggestion 2: [Название]

**Location:** `[file]:[line]`

**Current Code:**
```typescript
// Текущий код
```

**Suggested Change:**
```typescript
// Предложенный код
```

**Reason:**
[Почему это улучшение]

**Priority:** [High/Medium/Low]

---

### 8.3 Issues Found ❌

#### Issue 1: [Название]

**Severity:** [Critical/High/Medium/Low]

**Location:** `[file]:[line]`

**Problem:**
```typescript
// Проблемный код
```

**Why it's a problem:**
[Объяснение проблемы]

**How to fix:**
```typescript
// Исправленный код
```

**Must fix before merge:** [Yes/No]

---

#### Issue 2: [Название]

**Severity:** [Critical/High/Medium/Low]

**Location:** `[file]:[line]`

**Problem:**
[Описание]

**How to fix:**
[Решение]

**Must fix before merge:** [Yes/No]

---

## 9. File-by-File Comments

### `[file1.ts]`

**Line [X]:**
```typescript
// Код
```
💡 Suggestion: [комментарий]

**Line [Y]:**
```typescript
// Код
```
❌ Issue: [комментарий]

**Line [Z]:**
```typescript
// Код
```
✅ Good: [комментарий]

---

### `[file2.ts]`

**Line [X]:**
[Комментарий]

---

## 10. Questions for Author

1. **[Question 1]**
   [Детали вопроса]

2. **[Question 2]**
   [Детали вопроса]

3. **[Question 3]**
   [Детали вопроса]

---

## 11. Testing Notes

### What I Tested

- [ ] Scenario 1: [описание]
  - Result: [Pass/Fail]
  - Notes: [заметки]

- [ ] Scenario 2: [описание]
  - Result: [Pass/Fail]
  - Notes: [заметки]

- [ ] Edge case 1: [описание]
  - Result: [Pass/Fail]
  - Notes: [заметки]

### What Author Should Test

- [ ] Test 1: [описание]
- [ ] Test 2: [описание]
- [ ] Test 3: [описание]

---

## 12. Decision

### ✅ Approve

**Conditions:**
- [ ] No conditions (approve as is)
- [ ] Minor changes requested (can merge after)
- [ ] Comments addressed

**Summary:**
[Краткое резюме почему approve]

---

### 🔄 Request Changes

**Must fix before merge:**
1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

**Summary:**
[Краткое резюме почему request changes]

---

### 💬 Comment

**Not blocking merge, but:**
- [Comment 1]
- [Comment 2]

**Summary:**
[Краткое резюме]

---

## 13. Follow-up Actions

### For Author
- [ ] Action 1: [что сделать]
- [ ] Action 2: [что сделать]

### For Reviewer
- [ ] Re-review after changes
- [ ] Test specific scenario
- [ ] Update documentation

### For Team
- [ ] Update coding standards
- [ ] Add to review checklist
- [ ] Share learning

---

## 14. Learning & Knowledge Sharing

### New Patterns/Techniques Learned

[Что нового узнал из этого PR]

### Worth Sharing with Team

[Что стоит рассказать команде]

---

## 15. Estimated Review Time

**Time Spent:** [X hours]

**Complexity:** [Low/Medium/High]

---

## 16. Additional Notes

[Любые дополнительные заметки]

---

**AI: Проведи детальный code review, будь конструктивным и конкретным**
