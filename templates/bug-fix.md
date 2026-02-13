# 🐛 Bug Fix Template

## 1. Bug Summary

**Bug ID:** [номер issue/ticket]

**Title:** [Краткое описание бага]

**Severity:** [Critical/High/Medium/Low]

**Priority:** [P0/P1/P2/P3]

**Status:** [New/In Progress/Fixed/Verified/Closed]

**Reported By:** [кто нашел]

**Assigned To:** [кто исправляет]

**Date Reported:** [YYYY-MM-DD]

**Date Fixed:** [YYYY-MM-DD]

---

## 2. Bug Description

### What is happening? (Actual Behavior)

[Детальное описание что происходит]

### What should happen? (Expected Behavior)

[Детальное описание что должно происходить]

### Impact

**Affected Users:**
- [ ] All users
- [ ] Teachers only
- [ ] Students only
- [ ] Admins only
- [ ] Specific group: [описание]

**Frequency:**
- [ ] Always (100%)
- [ ] Often (>50%)
- [ ] Sometimes (10-50%)
- [ ] Rare (<10%)

**Business Impact:**
- [ ] Blocks critical functionality
- [ ] Causes data loss
- [ ] Causes incorrect results
- [ ] Causes poor UX
- [ ] Minor inconvenience

---

## 3. Steps to Reproduce

### Prerequisites
- [ ] User role: [admin/teacher/student]
- [ ] Browser: [Chrome/Firefox/Safari]
- [ ] Environment: [dev/staging/production]
- [ ] Data setup: [описание нужных данных]

### Steps
1. [Шаг 1]
2. [Шаг 2]
3. [Шаг 3]
4. [Шаг 4]

### Expected Result
[Что должно произойти]

### Actual Result
[Что происходит на самом деле]

---

## 4. Environment Details

**Frontend:**
- Browser: [Chrome 120, Firefox 121, etc.]
- OS: [Windows 11, macOS 14, etc.]
- Screen size: [1920x1080, mobile, etc.]

**Backend:**
- Node version: [v20.x]
- MongoDB version: [7.x]
- Redis version: [7.x]

**Network:**
- Connection: [WiFi/4G/5G]
- Speed: [fast/slow]

---

## 5. Evidence

### Screenshots
[Прикрепить скриншоты]

### Console Errors
```javascript
// Browser console
Error: [error message]
  at [stack trace]
```

### Server Logs
```
[2025-02-12 10:00:00] ERROR: [error message]
[2025-02-12 10:00:00] Stack: [stack trace]
```

### Network Requests
```http
POST /api/tests/import
Status: 400 Bad Request

Response:
{
  "message": "Error message",
  "details": "..."
}
```

---

## 6. Technical Analysis

### Root Cause

**Location:** `[file path]:[line number]`

**Code:**
```typescript
// Проблемный код
function buggyFunction() {
  // ...
}
```

**Why it happens:**
[Детальное объяснение почему возникает баг]

**Related Code:**
- `[file1.ts]` - [как связано]
- `[file2.ts]` - [как связано]

---

## 7. Solution

### Proposed Fix

**Approach:** [описание подхода]

**Code Changes:**

```typescript
// Before (buggy)
function buggyFunction() {
  // Проблемный код
}

// After (fixed)
function fixedFunction() {
  // Исправленный код
}
```

**Files to Change:**
- [ ] `[file1.ts]` - [что изменить]
- [ ] `[file2.ts]` - [что изменить]
- [ ] `[file3.ts]` - [что изменить]

---

### Alternative Solutions

#### Alternative 1: [Название]

**Pros:**
- ✅ Преимущество 1
- ✅ Преимущество 2

**Cons:**
- ❌ Недостаток 1
- ❌ Недостаток 2

**Why not chosen:**
[Объяснение]

---

#### Alternative 2: [Название]

**Pros:**
- ✅ Преимущество 1

**Cons:**
- ❌ Недостаток 1

**Why not chosen:**
[Объяснение]

---

## 8. Implementation Plan

### Step 1: [Название]
**Estimated Time:** [время]

- [ ] Task 1
- [ ] Task 2

### Step 2: [Название]
**Estimated Time:** [время]

- [ ] Task 3
- [ ] Task 4

### Step 3: Testing
**Estimated Time:** [время]

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

---

## 9. Testing Strategy

### Unit Tests

```typescript
// [file].test.ts
describe('[functionName]', () => {
  it('should handle [edge case]', () => {
    // Test that bug is fixed
    expect([functionName](input)).toBe(expected);
  });
  
  it('should not break existing functionality', () => {
    // Regression test
    expect([functionName](normalInput)).toBe(normalExpected);
  });
});
```

### Integration Tests

```typescript
// [feature].test.ts
describe('[API endpoint]', () => {
  it('should handle [bug scenario]', async () => {
    const res = await request(app)
      .post('/api/[endpoint]')
      .send(buggyData);
    
    expect(res.status).toBe(200); // Should not error
  });
});
```

### Manual Testing Checklist

- [ ] Воспроизвести баг (должен быть исправлен)
- [ ] Проверить edge cases
- [ ] Проверить на разных браузерах
- [ ] Проверить на разных ролях
- [ ] Проверить что не сломали другую функциональность

---

## 10. Prevention

### How to prevent similar bugs in the future?

**Code Level:**
- [ ] Add validation: [где]
- [ ] Add error handling: [где]
- [ ] Add type checking: [где]
- [ ] Add tests: [какие]

**Process Level:**
- [ ] Update code review checklist
- [ ] Add to testing scenarios
- [ ] Update documentation
- [ ] Add linting rule (если возможно)

**Monitoring:**
- [ ] Add logging: [где]
- [ ] Add metrics: [какие]
- [ ] Add alerts: [какие]

---

## 11. Rollback Plan

### If fix causes issues:

**Step 1:** Identify the issue
- Monitor logs for errors
- Check metrics for anomalies

**Step 2:** Rollback
```bash
# Revert commit
git revert [commit-hash]

# Deploy previous version
npm run deploy:rollback
```

**Step 3:** Communicate
- Notify team
- Update status page (если есть)
- Inform affected users

---

## 12. Deployment

### Pre-deployment Checklist
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Staging tested
- [ ] Rollback plan ready

### Deployment Steps
1. [ ] Deploy to staging
2. [ ] Smoke test on staging
3. [ ] Deploy to production
4. [ ] Monitor for 1 hour
5. [ ] Verify fix in production

### Post-deployment
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Update bug status to "Verified"

---

## 13. Communication

### Internal
- [ ] Update ticket/issue
- [ ] Notify team in Slack/Discord
- [ ] Update changelog

### External (if needed)
- [ ] Notify affected users
- [ ] Update status page
- [ ] Post in community forum

---

## 14. Lessons Learned

### What went well?
- [Что прошло хорошо]

### What could be improved?
- [Что можно улучшить]

### Action items for future:
- [ ] Action 1
- [ ] Action 2

---

## 15. Related Issues

- [Link to related bug #1]
- [Link to related bug #2]
- [Link to related feature request]

---

## 16. References

- [Link to documentation]
- [Link to Stack Overflow]
- [Link to similar issue in other project]

---

## 17. Updates

### [YYYY-MM-DD] - Update 1
[Что изменилось]

### [YYYY-MM-DD] - Update 2
[Что изменилось]

---

**AI: Проанализируй баг детально, найди root cause, предложи решение**
