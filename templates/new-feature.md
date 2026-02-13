# 🎯 New Feature Template

## 1. Feature Brief

**Feature Name:** [Название фичи]

**Priority:** [Critical/High/Medium/Low]

**Estimated Effort:** [Small (1-3 days) / Medium (1-2 weeks) / Large (2+ weeks)]

**Target Release:** [версия или дата]

**Owner:** [кто отвечает]

---

## 2. Problem Statement

### What problem are we solving?

[Детальное описание проблемы]

### Who is affected?

- [ ] Teachers
- [ ] Students
- [ ] Admins
- [ ] Other: [specify]

### Current workaround (if any)

[Как пользователи решают эту проблему сейчас]

---

## 3. User Stories

### Story 1: [Название]

**As a** [role]  
**I want to** [action]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Критерий 1
- [ ] Критерий 2
- [ ] Критерий 3

---

### Story 2: [Название]

**As a** [role]  
**I want to** [action]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Критерий 1
- [ ] Критерий 2

---

## 4. Technical Breakdown

### 4.1 Frontend (client/)

#### New Pages
- [ ] `pages/[path]/[PageName].tsx` - [описание]

#### New Components
- [ ] `components/[ComponentName].tsx` - [описание]
- [ ] `components/ui/[UIComponent].tsx` - [описание]

#### New Hooks
- [ ] `hooks/use[HookName].ts` - [описание]

#### State Management
- [ ] Zustand store: [store name] - [что хранит]
- [ ] React Query: [query keys] - [что кэширует]

#### Routing
```typescript
// Добавить в App.tsx
<Route path="/[path]" element={<PageName />} />
```

---

### 4.2 Backend (server/)

#### New Routes
```typescript
// server/src/routes/[feature].routes.ts

router.get('/api/[resource]', authenticate, get[Resource]);
router.post('/api/[resource]', authenticate, create[Resource]);
router.put('/api/[resource]/:id', authenticate, update[Resource]);
router.delete('/api/[resource]/:id', authenticate, delete[Resource]);
```

#### New Models
```typescript
// server/src/models/[Model].ts

const [Model]Schema = new Schema({
  field1: { type: String, required: true },
  field2: { type: Number, default: 0 },
  // ...
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
}, { timestamps: true });

// Индексы
[Model]Schema.index({ branchId: 1, createdBy: 1 });
```

#### New Services
- [ ] `services/[service].ts` - [описание логики]

#### Middleware
- [ ] Authentication: `authenticate`
- [ ] Permissions: `requirePermission('[permission]')`
- [ ] Validation: [описание]

---

### 4.3 Database Changes

#### New Collections
```javascript
// MongoDB collection: [collection_name]
{
  _id: ObjectId,
  field1: String,
  field2: Number,
  // ...
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes
```javascript
db.[collection].createIndex({ field1: 1, field2: 1 });
db.[collection].createIndex({ branchId: 1 });
```

#### Migrations (if needed)
```javascript
// Migration script: server/src/scripts/migrate[Feature].ts
// [описание что мигрируем]
```

---

### 4.4 External Services

#### APIs to integrate
- [ ] Service 1: [название] - [для чего]
- [ ] Service 2: [название] - [для чего]

#### Environment Variables
```env
# .env
[SERVICE]_API_KEY=your-api-key
[SERVICE]_URL=https://api.service.com
```

---

## 5. UI/UX Design

### Wireframes
[Ссылка на Figma/скриншоты или ASCII art]

```
┌─────────────────────────────────┐
│  Header                         │
├─────────────────────────────────┤
│  [Component 1]                  │
│  ┌───────────┐  ┌───────────┐  │
│  │ Card 1    │  │ Card 2    │  │
│  └───────────┘  └───────────┘  │
│  [Component 2]                  │
└─────────────────────────────────┘
```

### User Flow
```
1. User lands on [page]
   ↓
2. User clicks [button]
   ↓
3. Modal opens with [form]
   ↓
4. User fills form and submits
   ↓
5. Success message + redirect to [page]
```

### UI Components Needed
- [ ] Button variant: [описание]
- [ ] Input type: [описание]
- [ ] Modal: [описание]
- [ ] Card: [описание]

---

## 6. API Specification

### Endpoint 1: Get [Resource]

**Request:**
```http
GET /api/[resource]?filter=[value]
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "123",
      "field1": "value",
      "field2": 42
    }
  ],
  "total": 10
}
```

**Errors:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - No permission
- `500 Server Error` - Internal error

---

### Endpoint 2: Create [Resource]

**Request:**
```http
POST /api/[resource]
Authorization: Bearer <token>
Content-Type: application/json

{
  "field1": "value",
  "field2": 42
}
```

**Response (201):**
```json
{
  "id": "123",
  "field1": "value",
  "field2": 42,
  "createdAt": "2025-02-12T10:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid token
- `500 Server Error` - Internal error

---

## 7. Security Considerations

### Authentication & Authorization
- [ ] Требуется аутентификация (JWT)
- [ ] Проверка прав доступа (permissions)
- [ ] Фильтрация по branchId

### Input Validation
- [ ] Валидация на фронтенде (React Hook Form)
- [ ] Валидация на бэкенде (express-validator)
- [ ] Sanitization (XSS protection)

### Data Privacy
- [ ] Личные данные защищены
- [ ] Логи не содержат sensitive data
- [ ] GDPR compliance (если нужно)

### Rate Limiting
- [ ] Rate limit для API endpoints
- [ ] Защита от DDoS

---

## 8. Performance Considerations

### Frontend
- [ ] Lazy loading компонентов
- [ ] Debounce для search/filter
- [ ] Optimistic UI updates
- [ ] Pagination для больших списков

### Backend
- [ ] Индексы в MongoDB
- [ ] `.lean()` для read-only queries
- [ ] `.select()` для выборки только нужных полей
- [ ] Кэширование (если нужно)

### Database
- [ ] Indexes на часто используемые поля
- [ ] Aggregation pipelines оптимизированы
- [ ] Избегаем N+1 queries

---

## 9. Testing Strategy

### Unit Tests
```typescript
// utils/[util].test.ts
describe('[functionName]', () => {
  it('should [expected behavior]', () => {
    expect([functionName](input)).toBe(expected);
  });
});
```

### Integration Tests
```typescript
// routes/[feature].test.ts
describe('GET /api/[resource]', () => {
  it('should return list of resources', async () => {
    const res = await request(app)
      .get('/api/[resource]')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});
```

### E2E Tests (Manual)
- [ ] Сценарий 1: [описание]
- [ ] Сценарий 2: [описание]
- [ ] Edge case 1: [описание]
- [ ] Edge case 2: [описание]

---

## 10. Rollout Plan

### Phase 1: Development
**Timeline:** [даты]

- [ ] Backend implementation
- [ ] Frontend implementation
- [ ] Unit tests
- [ ] Integration tests

### Phase 2: Testing
**Timeline:** [даты]

- [ ] Internal testing (dev environment)
- [ ] Bug fixes
- [ ] Performance testing
- [ ] Security review

### Phase 3: Deployment
**Timeline:** [даты]

- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Deploy to production
- [ ] Monitor logs/metrics

### Phase 4: Monitoring
**Timeline:** [даты]

- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Iterate based on feedback

---

## 11. Documentation Updates

### Code Documentation
- [ ] JSDoc comments для функций
- [ ] README updates (если нужно)
- [ ] API documentation

### User Documentation
- [ ] User guide (если нужно)
- [ ] FAQ updates
- [ ] Video tutorial (если нужно)

### Internal Documentation
- [ ] Update `AGENTS.md` (если новые паттерны)
- [ ] Update `client/src/README.md` (если новые компоненты)
- [ ] Update `server/src/README.md` (если новые routes)
- [ ] Create bead in `beads/` для отслеживания

---

## 12. Success Metrics

### Quantitative
- [ ] Metric 1: [название] - Target: [значение]
- [ ] Metric 2: [название] - Target: [значение]
- [ ] Metric 3: [название] - Target: [значение]

### Qualitative
- [ ] User feedback: [как собираем]
- [ ] Bug reports: [ожидаемое количество]
- [ ] Support tickets: [ожидаемое количество]

### Review Date
[Дата когда пересмотрим метрики]

---

## 13. Dependencies & Blockers

### Dependencies
- [ ] Dependency 1: [что нужно сделать до этой фичи]
- [ ] Dependency 2: [внешний сервис/API]

### Blockers
- [ ] Blocker 1: [что блокирует разработку]
- [ ] Blocker 2: [нерешенные вопросы]

---

## 14. Open Questions

- [ ] Question 1: [вопрос]
- [ ] Question 2: [вопрос]
- [ ] Question 3: [вопрос]

---

## 15. References

- [Link 1: похожая фича]
- [Link 2: документация API]
- [Link 3: design inspiration]

---

## 16. Updates

### [YYYY-MM-DD] - Update 1
[Что изменилось в плане]

### [YYYY-MM-DD] - Update 2
[Что изменилось в плане]

---

**AI: Заполни этот template детально, задавай уточняющие вопросы**
