# 🗄️ Задача #4: Запросы к базе данных

## 📊 Статус: 📖 СПРАВОЧНАЯ

**Приоритет:** 🟢 ИНФОРМАЦИЯ  
**Дата создания:** 2025-01-XX

---

## 🎯 Описание

Документация по оптимизации и отладке запросов к MongoDB.

---

## 📋 Основные коллекции

### 1. tests
**Описание:** Обычные тесты для групп

**Поля:**
```typescript
{
  _id: ObjectId,
  name: string,
  groupId: ObjectId,          // Ссылка на Group
  subjectId: ObjectId,        // Ссылка на Subject
  classNumber: number,
  questions: Array,
  branchId: ObjectId,         // Ссылка на Branch
  createdBy: ObjectId,        // Ссылка на User
  createdAt: Date,
  updatedAt: Date
}
```

**Индексы:**
```javascript
{ branchId: 1, createdAt: -1 }
{ createdBy: 1, createdAt: -1 }
{ groupId: 1 }
```

### 2. blockTests
**Описание:** Блок-тесты для классов (несколько предметов)

**Поля:**
```typescript
{
  _id: ObjectId,
  classNumber: number,
  date: Date,
  periodMonth: number,
  periodYear: number,
  subjectTests: [{
    subjectId: ObjectId,      // Ссылка на Subject
    questions: Array
  }],
  studentConfigs: Array,
  branchId: ObjectId,         // Ссылка на Branch
  createdBy: ObjectId,        // Ссылка на User
  createdAt: Date,
  updatedAt: Date
}
```

**Индексы:**
```javascript
{ branchId: 1, classNumber: 1, periodMonth: 1, periodYear: 1 }
{ createdAt: -1 }
```

### 3. students
**Описание:** Студенты

**Поля:**
```typescript
{
  _id: ObjectId,
  fullName: string,
  classNumber: number,
  branchId: ObjectId,
  groupId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Индексы:**
```javascript
{ branchId: 1, classNumber: 1 }
{ groupId: 1 }
```

---

## 🚀 Оптимизация запросов

### 1. Используй .lean()
**Зачем:** Возвращает plain JavaScript объекты вместо Mongoose документов

**Производительность:** ~5x быстрее

```typescript
// ❌ Медленно
const tests = await Test.find(filter);

// ✅ Быстро
const tests = await Test.find(filter).lean();
```

### 2. Используй .select()
**Зачем:** Выбирает только нужные поля

**Производительность:** Меньше данных = быстрее

```typescript
// ❌ Загружает все поля (включая большие массивы questions)
const tests = await Test.find(filter);

// ✅ Загружает только нужные поля
const tests = await Test.find(filter)
  .select('name createdAt _id')
  .lean();
```

### 3. Используй индексы
**Зачем:** Ускоряет поиск в БД

**Производительность:** ~100x быстрее для больших коллекций

```typescript
// ✅ Использует индекс { branchId: 1, createdAt: -1 }
const tests = await Test.find({ branchId })
  .sort({ createdAt: -1 })
  .lean();
```

### 4. Ограничивай результаты
**Зачем:** Не загружать лишние данные

```typescript
// ❌ Загружает все тесты
const tests = await Test.find(filter);

// ✅ Загружает только первые 50
const tests = await Test.find(filter)
  .limit(50)
  .lean();
```

### 5. Используй .populate() осторожно
**Зачем:** Популяция делает дополнительные запросы

```typescript
// ❌ Популирует все поля
const tests = await Test.find(filter)
  .populate('groupId')
  .populate('subjectId');

// ✅ Популирует только нужные поля
const tests = await Test.find(filter)
  .populate('groupId', 'name classNumber')
  .populate('subjectId', 'nameUzb')
  .lean();
```

---

## 🔍 Отладка запросов

### 1. Логирование запросов
```typescript
// Включить логи Mongoose
mongoose.set('debug', true);

// Или вручную
console.log('🔍 Query:', { filter, sort, limit });
const result = await Test.find(filter).sort(sort).limit(limit);
console.log('✅ Result:', result.length, 'documents');
```

### 2. Explain запроса
```typescript
const explain = await Test.find(filter).explain('executionStats');
console.log('📊 Execution stats:', {
  executionTimeMs: explain.executionStats.executionTimeMs,
  totalDocsExamined: explain.executionStats.totalDocsExamined,
  totalKeysExamined: explain.executionStats.totalKeysExamined,
  indexUsed: explain.executionStats.executionStages.indexName
});
```

### 3. Проверка индексов
```bash
mongosh "mongodb://localhost:27017/resultma"

# Показать индексы коллекции
db.tests.getIndexes()

# Создать индекс
db.tests.createIndex({ branchId: 1, createdAt: -1 })

# Удалить индекс
db.tests.dropIndex("index_name")
```

---

## 🐛 Частые проблемы

### Проблема #1: Медленные запросы
**Симптомы:** Запросы выполняются > 1 секунды

**Причины:**
- ❌ Нет индекса на поле фильтрации
- ❌ Популяция больших коллекций
- ❌ Загрузка всех полей

**Решение:**
```typescript
// Добавить индекс
db.tests.createIndex({ branchId: 1, createdAt: -1 })

// Оптимизировать запрос
const tests = await Test.find({ branchId })
  .select('name createdAt _id')
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();
```

### Проблема #2: Популяция возвращает null
**Симптомы:** `groupId: null` в результате

**Причины:**
- ❌ Документ удален
- ❌ Неправильный ObjectId
- ❌ Нет прав доступа

**Решение:**
```typescript
// Проверить существование документа
const group = await Group.findById(groupId);
if (!group) {
  console.log('❌ Group not found:', groupId);
}

// Или использовать populate с match
.populate({
  path: 'groupId',
  select: 'name classNumber',
  match: { isActive: true }
})
```

### Проблема #3: Дубликаты в результатах
**Симптомы:** Один тест появляется несколько раз

**Причины:**
- ❌ Неправильный запрос (join)
- ❌ Дубликаты в БД

**Решение:**
```bash
# Найти дубликаты
db.tests.aggregate([
  { $group: { _id: "$name", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

# Удалить дубликаты (ОСТОРОЖНО!)
# db.tests.aggregate([...]) // найти дубликаты
# db.tests.deleteOne({ _id: ObjectId('...') }) // удалить по одному
```

---

## 📊 Примеры запросов

### Получить тесты учителя
```typescript
const tests = await Test.find({
  branchId: req.user.branchId,
  createdBy: req.user.id
})
  .select('name createdAt _id')
  .sort({ createdAt: -1 })
  .lean();
```

### Получить блок-тесты класса
```typescript
const blockTests = await BlockTest.find({
  branchId: req.user.branchId,
  classNumber: 7
})
  .populate('subjectTests.subjectId', 'nameUzb')
  .sort({ date: -1 })
  .lean();
```

### Получить студентов группы
```typescript
const students = await Student.find({
  branchId: req.user.branchId,
  groupId: groupId
})
  .select('fullName classNumber _id')
  .sort({ fullName: 1 })
  .lean();
```

### Подсчитать количество тестов
```typescript
const count = await Test.countDocuments({
  branchId: req.user.branchId,
  createdBy: req.user.id
});
```

### Найти тест по ID с популяцией
```typescript
const test = await Test.findById(testId)
  .populate('groupId', 'name classNumber letter')
  .populate('subjectId', 'nameUzb nameRu')
  .populate('createdBy', 'fullName')
  .lean();
```

---

## 🔧 Полезные команды MongoDB

```bash
# Подключиться к БД
mongosh "mongodb://localhost:27017/resultma"

# Показать коллекции
show collections

# Подсчитать документы
db.tests.countDocuments()

# Найти последние 5 тестов
db.tests.find().sort({createdAt: -1}).limit(5).pretty()

# Найти тесты по фильтру
db.tests.find({ branchId: ObjectId('...') }).pretty()

# Обновить документ
db.tests.updateOne(
  { _id: ObjectId('...') },
  { $set: { name: 'New name' } }
)

# Удалить документ
db.tests.deleteOne({ _id: ObjectId('...') })

# Создать индекс
db.tests.createIndex({ branchId: 1, createdAt: -1 })

# Показать индексы
db.tests.getIndexes()

# Статистика коллекции
db.tests.stats()
```

---

## 📚 Связанные задачи

- `beads/01-test-import-issue.md` - Проблема с отображением тестов
- `beads/02-cache-system.md` - Система кэширования
- `beads/03-authentication.md` - Аутентификация

---

**Статус:** Документация актуальна
