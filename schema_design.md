# Schema Design: Fitness Tracker (MongoDB)

## Сущности системы

Система содержит три основные сущности: **User**, **Exercise**, **Workout**.

---

## Коллекции и структура документов

### 1. `users`

```json
{
  "_id": ObjectId,
  "login": "string (unique)",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "age": "number",
  "weight_kg": "number",
  "height_cm": "number",
  "created_at": "Date"
}
```

### 2. `exercises`

```json
{
  "_id": ObjectId,
  "name": "string (unique)",
  "category": "string (cardio|strength|flexibility|balance)",
  "muscle_groups": ["string"],
  "description": "string",
  "equipment": "string",
  "difficulty": "string (beginner|intermediate|advanced)",
  "created_at": "Date"
}
```

### 3. `workouts`

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "title": "string",
  "date": "Date",
  "duration_minutes": "number",
  "notes": "string",
  "exercises": [
    {
      "exercise_id": ObjectId,
      "exercise_name": "string",
      "sets": "number",
      "reps": "number",
      "weight_kg": "number",
      "duration_seconds": "number",
      "order": "number"
    }
  ],
  "created_at": "Date"
}
```

---

## Обоснование выбора Embedded vs References

### `workouts.exercises` — **Embedded documents** ✅

**Причины:**
- Упражнения внутри тренировки — это *снимок данных на момент тренировки*. Если
  упражнение изменится (описание, категория), история тренировок не должна меняться.
- Данные всегда читаются вместе: при получении тренировки нужны все её упражнения.
- Нет необходимости в независимом запросе к упражнениям внутри тренировки.
- Количество упражнений в тренировке ограничено (обычно 5–20), документ не вырастет бесконтрольно.

**Что дополнительно хранится в embedded-документе:**
- `exercise_name` — денормализованное имя для быстрого отображения без JOIN.
- `exercise_id` — ссылка на оригинальное упражнение для возможности lookup при необходимости.

### `workouts.user_id` — **Reference (DBRef)** ✅

**Причины:**
- Пользователь может иметь сотни тренировок; встраивание всех тренировок в документ
  пользователя приведёт к документу, превышающему лимит MongoDB в 16 МБ.
- Тренировки часто запрашиваются независимо (история, статистика).
- При обновлении данных пользователя не нужно обновлять все его тренировки.

### `exercises` — **Отдельная коллекция** ✅

**Причины:**
- Упражнения — справочник, используемый при создании тренировок.
- Список упражнений нужно получать независимо (каталог упражнений).
- Одно упражнение используется в множестве тренировок разных пользователей.

---

## Индексы

```javascript
// users
db.users.createIndex({ login: 1 }, { unique: true })
db.users.createIndex({ first_name: 1, last_name: 1 })

// exercises
db.exercises.createIndex({ name: 1 }, { unique: true })
db.exercises.createIndex({ category: 1 })

// workouts
db.workouts.createIndex({ user_id: 1 })
db.workouts.createIndex({ user_id: 1, date: -1 })
db.workouts.createIndex({ date: 1 })
```
