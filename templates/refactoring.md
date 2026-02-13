# ♻️ Refactoring Template

## 1. Refactoring Overview

**Title:** [Название рефакторинга]

**Scope:** [Small/Medium/Large]

**Estimated Effort:** [X days/weeks]

**Priority:** [High/Medium/Low]

**Owner:** [кто отвечает]

**Date Started:** [YYYY-MM-DD]

**Target Completion:** [YYYY-MM-DD]

---

## 2. Current State Analysis

### 2.1 Code Location

**Files to Refactor:**
- `[file1.ts]` - [X lines]
- `[file2.ts]` - [Y lines]
- `[file3.ts]` - [Z lines]

**Total Lines:** [N lines]

---

### 2.2 Code Smells Identified

#### Smell 1: [Название]

**Location:** `[file]:[line]`

**Type:** [Duplicated Code/Long Method/Large Class/Long Parameter List/etc.]

**Example:**
```typescript
// Проблемный код
```

**Why it's a problem:**
[Объяснение]

**Impact:** [High/Medium/Low]

---

#### Smell 2: [Название]

**Location:** `[file]:[line]`

**Type:** [тип]

**Example:**
```typescript
// Проблемный код
```

**Why it's a problem:**
[Объяснение]

**Impact:** [High/Medium/Low]

---

### 2.3 Technical Debt

**Debt Type:**
- [ ] Code quality issues
- [ ] Performance issues
- [ ] Security issues
- [ ] Maintainability issues
- [ ] Scalability issues
- [ ] Testing gaps

**Debt Level:** [High/Medium/Low]

**Cost of NOT refactoring:**
[Что будет если не рефакторить]

---

### 2.4 Current Issues

1. **Issue 1:** [описание]
   - Frequency: [как часто проявляется]
   - Impact: [влияние на пользователей/разработку]

2. **Issue 2:** [описание]
   - Frequency: [как часто]
   - Impact: [влияние]

3. **Issue 3:** [описание]
   - Frequency: [как часто]
   - Impact: [влияние]

---

## 3. Refactoring Goals

### Primary Goals

1. **Goal 1:** [цель]
   - Success Metric: [как измерить]
   - Target: [целевое значение]

2. **Goal 2:** [цель]
   - Success Metric: [как измерить]
   - Target: [целевое значение]

### Secondary Goals

1. **Goal 3:** [цель]
2. **Goal 4:** [цель]

---

## 4. Refactoring Plan

### 4.1 Strategy

**Approach:** [Big Bang / Incremental / Strangler Fig Pattern]

**Rationale:**
[Почему выбрали этот подход]

---

### 4.2 Step-by-Step Plan

#### Step 1: [Название]

**What:** [что делаем]

**Why:** [зачем]

**How:**
```typescript
// Before
function oldCode() {
  // ...
}

// After
function newCode() {
  // ...
}
```

**Files Changed:**
- `[file1.ts]`
- `[file2.ts]`

**Estimated Time:** [X hours]

**Risk Level:** [Low/Medium/High]

---

#### Step 2: [Название]

**What:** [что делаем]

**Why:** [зачем]

**How:**
[Описание или код]

**Files Changed:**
- `[file3.ts]`

**Estimated Time:** [Y hours]

**Risk Level:** [Low/Medium/High]

---

#### Step 3: [Название]

**What:** [что делаем]

**Why:** [зачем]

**How:**
[Описание или код]

**Files Changed:**
- `[file4.ts]`

**Estimated Time:** [Z hours]

**Risk Level:** [Low/Medium/High]

---

### 4.3 Refactoring Techniques

**Techniques to Use:**
- [ ] Extract Method
- [ ] Extract Class
- [ ] Rename Variable/Function
- [ ] Move Method/Field
- [ ] Replace Conditional with Polymorphism
- [ ] Introduce Parameter Object
- [ ] Replace Magic Number with Constant
- [ ] Decompose Conditional
- [ ] Other: [specify]

---

## 5. Before & After Comparison

### 5.1 Code Structure

#### Before
```
src/
├── [old structure]
```

#### After
```
src/
├── [new structure]
```

---

### 5.2 Code Examples

#### Example 1: [Название]

**Before:**
```typescript
// Старый код (плохой)
function oldImplementation() {
  // Сложная логика
  // Много строк
  // Трудно понять
}
```

**After:**
```typescript
// Новый код (хороший)
function newImplementation() {
  // Простая логика
  // Понятная структура
}

// Вспомогательные функции
function helper1() { }
function helper2() { }
```

**Improvements:**
- ✅ Улучшение 1
- ✅ Улучшение 2
- ✅ Улучшение 3

---

#### Example 2: [Название]

**Before:**
```typescript
// Старый код
```

**After:**
```typescript
// Новый код
```

**Improvements:**
- ✅ Улучшение 1
- ✅ Улучшение 2

---

### 5.3 Metrics Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Lines of Code | [X] | [Y] | [±Z%] |
| Cyclomatic Complexity | [X] | [Y] | [±Z%] |
| Test Coverage | [X%] | [Y%] | [±Z%] |
| Number of Functions | [X] | [Y] | [±Z] |
| Average Function Length | [X] | [Y] | [±Z] |
| Code Duplication | [X%] | [Y%] | [±Z%] |

---

## 6. Breaking Changes

### 6.1 API Changes

#### Change 1: [Название]

**Old API:**
```typescript
// Старый интерфейс
function oldApi(param1, param2) { }
```

**New API:**
```typescript
// Новый интерфейс
function newApi(options: { param1, param2 }) { }
```

**Migration Guide:**
```typescript
// Как мигрировать
// Before
oldApi(value1, value2);

// After
newApi({ param1: value1, param2: value2 });
```

**Affected Code:**
- `[file1.ts]` - [X occurrences]
- `[file2.ts]` - [Y occurrences]

---

#### Change 2: [Название]

[Аналогично]

---

### 6.2 Database Changes

**Schema Changes:**
```javascript
// Old schema
{
  oldField: String
}

// New schema
{
  newField: String
}
```

**Migration Script:**
```javascript
// server/src/scripts/migrate[Feature].ts
async function migrate() {
  // Migration logic
}
```

---

## 7. Testing Strategy

### 7.1 Test Plan

**Test Types:**
- [ ] Unit tests (existing + new)
- [ ] Integration tests
- [ ] Regression tests
- [ ] Performance tests
- [ ] Manual testing

---

### 7.2 Test Coverage

**Before Refactoring:**
- Unit: [X%]
- Integration: [Y%]
- Overall: [Z%]

**After Refactoring (Target):**
- Unit: [X%]
- Integration: [Y%]
- Overall: [Z%]

---

### 7.3 Regression Testing

**Critical Paths to Test:**
1. [Path 1]
2. [Path 2]
3. [Path 3]

**Test Scenarios:**
- [ ] Scenario 1: [описание]
- [ ] Scenario 2: [описание]
- [ ] Scenario 3: [описание]

---

## 8. Risks & Mitigation

### Risk 1: [Название]

**Description:** [описание риска]

**Probability:** [Low/Medium/High]

**Impact:** [Low/Medium/High]

**Mitigation:**
- [Как снизить риск]
- [Backup план]

---

### Risk 2: [Название]

**Description:** [описание риска]

**Probability:** [Low/Medium/High]

**Impact:** [Low/Medium/High]

**Mitigation:**
- [Как снизить риск]

---

## 9. Rollout Plan

### Phase 1: Preparation

**Timeline:** [даты]

**Tasks:**
- [ ] Create feature branch
- [ ] Set up testing environment
- [ ] Backup current code
- [ ] Communicate with team

---

### Phase 2: Implementation

**Timeline:** [даты]

**Tasks:**
- [ ] Step 1 implementation
- [ ] Step 2 implementation
- [ ] Step 3 implementation
- [ ] Code review
- [ ] Fix issues

---

### Phase 3: Testing

**Timeline:** [даты]

**Tasks:**
- [ ] Run all tests
- [ ] Manual testing
- [ ] Performance testing
- [ ] Security review

---

### Phase 4: Deployment

**Timeline:** [даты]

**Tasks:**
- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Deploy to production
- [ ] Monitor

---

### Phase 5: Monitoring

**Timeline:** [даты]

**Tasks:**
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Collect feedback
- [ ] Fix issues

---

## 10. Rollback Plan

### If refactoring causes issues:

**Step 1:** Identify the issue
- Check logs
- Check metrics
- Reproduce issue

**Step 2:** Decide
- [ ] Fix forward (if small issue)
- [ ] Rollback (if major issue)

**Step 3:** Rollback (if needed)
```bash
git revert [commit-hash]
npm run deploy:rollback
```

**Step 4:** Communicate
- Notify team
- Update status
- Plan next steps

---

## 11. Documentation Updates

### Code Documentation
- [ ] Update JSDoc comments
- [ ] Update inline comments
- [ ] Update README (if needed)

### Architecture Documentation
- [ ] Update architecture diagrams
- [ ] Update `AGENTS.md` (if patterns changed)
- [ ] Update `client/src/README.md` (if structure changed)
- [ ] Update `server/src/README.md` (if structure changed)

### Team Documentation
- [ ] Write migration guide
- [ ] Update onboarding docs
- [ ] Share learnings

---

## 12. Success Metrics

### Quantitative

**Before:**
- Metric 1: [value]
- Metric 2: [value]
- Metric 3: [value]

**After (Target):**
- Metric 1: [target]
- Metric 2: [target]
- Metric 3: [target]

**Actual (After Deployment):**
- Metric 1: [actual]
- Metric 2: [actual]
- Metric 3: [actual]

---

### Qualitative

- [ ] Code is easier to understand
- [ ] Code is easier to maintain
- [ ] Code is easier to test
- [ ] Team velocity improved
- [ ] Fewer bugs

---

## 13. Lessons Learned

### What Went Well

1. [Что прошло хорошо]
2. [Что прошло хорошо]

### What Could Be Improved

1. [Что можно улучшить]
2. [Что можно улучшить]

### Key Takeaways

1. [Ключевой вывод 1]
2. [Ключевой вывод 2]
3. [Ключевой вывод 3]

### Action Items for Future

- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---

## 14. References

- [Link to design doc]
- [Link to similar refactoring]
- [Link to best practices]

---

## 15. Updates

### [YYYY-MM-DD] - Update 1
[Что изменилось в плане]

### [YYYY-MM-DD] - Update 2
[Что изменилось в плане]

---

**AI: Проанализируй код, найди code smells, предложи план рефакторинга**
