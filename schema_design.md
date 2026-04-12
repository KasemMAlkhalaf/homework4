# Schema Design: Фитнес-трекер (MongoDB)

## Обзор системы

Система фитнес-трекера содержит три основные сущности:
- **User** (Пользователь)
- **Exercise** (Упражнение)
- **Workout** (Тренировка)

---

## Коллекции и структура документов

### 1. Коллекция `users`

```json
{
  "_id": ObjectId,
  "login": "string (unique)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "passwordHash": "string",
  "age": "number",
  "weight": "number (kg)",
  "height": "number (cm)",
  "goal": "string (enum: weight_loss | muscle_gain | endurance | flexibility)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Почему не embedded тренировки/упражнения?**
Тренировки могут исчисляться сотнями — хранить их внутри пользователя привело бы к
разрастанию документа свыше лимита MongoDB (16 MB). Используем **references**.

---

### 2. Коллекция `exercises`

```json
{
  "_id": ObjectId,
  "name": "string (unique)",
  "category": "string (enum: cardio | strength | flexibility | balance)",
  "muscleGroups": ["string"],
  "description": "string",
  "unit": "string (enum: reps | seconds | meters)",
  "defaultSets": "number",
  "defaultReps": "number",
  "createdAt": "Date"
}
```

**Почему отдельная коллекция?**
Упражнения — это справочник (catalog), общий для всех пользователей.
Дублировать их в каждой тренировке нецелесообразно → **reference** из тренировки.

---

### 3. Коллекция `workouts`

```json
{
  "_id": ObjectId,
  "userId": "ObjectId → users._id",
  "title": "string",
  "date": "Date",
  "durationMinutes": "number",
  "notes": "string",
  "exercises": [
    {
      "exerciseId": "ObjectId → exercises._id",
      "sets": "number",
      "reps": "number",
      "weight": "number (kg, optional)",
      "duration": "number (seconds, optional)",
      "distance": "number (meters, optional)",
      "completed": "boolean"
    }
  ],
  "totalCaloriesBurned": "number",
  "heartRateAvg": "number (optional)",
  "createdAt": "Date"
}
```

**Почему `exercises` — embedded array внутри workout?**

Набор упражнений в тренировке — это **денормализованная копия** конкретного выполнения.
Данные выполнения (sets, reps, weight) уникальны для каждой сессии и не меняются после
записи. Загрузка тренировки требует сразу все её упражнения → embedded оптимален.

При этом `exerciseId` сохраняется как reference, чтобы можно было получить мета-данные
упражнения (название, категория) при необходимости через `$lookup`.

---

## Сводная таблица решений Embedded vs References

| Связь | Решение | Обоснование |
|-------|---------|-------------|
| User → Workouts | **Reference** (userId в workout) | Неограниченный рост, нужна пагинация истории |
| Workout → ExerciseSet | **Embedded** (массив в workout) | Данные выполнения — часть тренировки, всегда читаются вместе |
| ExerciseSet → Exercise | **Reference** (exerciseId) | Упражнение — справочник, данные могут обновляться |
| User → Exercises | **Reference** (через workout) | Упражнения глобальные, не принадлежат пользователю |

---

## Индексы

```javascript
// users
db.users.createIndex({ login: 1 }, { unique: true });
db.users.createIndex({ firstName: 1, lastName: 1 });

// exercises
db.exercises.createIndex({ name: 1 }, { unique: true });
db.exercises.createIndex({ category: 1 });

// workouts
db.workouts.createIndex({ userId: 1, date: -1 });
db.workouts.createIndex({ userId: 1, date: -1, "exercises.exerciseId": 1 });
```
