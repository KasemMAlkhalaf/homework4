# 🏋️ Fitness Tracker — Домашнее задание 04

**Вариант 14 — Фитнес-трекер**
**Стек:** Python · FastAPI · MongoDB · Motor · Docker

---

## 📌 Описание

REST API для управления пользователями, упражнениями и тренировками.
Проект построен с использованием **лучших практик моделирования MongoDB** (embedded + references).

---

## 🚀 Возможности

* 👤 Управление пользователями (создание, поиск, фильтрация)
* 🏋️ Каталог упражнений (категории, уровень сложности)
* 📅 Учёт тренировок и история
* 📊 Статистика за выбранный период
* ✅ Валидация через JSON Schema
* 🐳 Запуск через Docker

---

## 📁 Структура проекта

```
fitness-tracker/
├── app/
│   ├── main.py            # FastAPI приложение
│   ├── requirements.txt
│   └── Dockerfile
├── schema_design.md       # Описание модели данных
├── data.js                # Тестовые данные
├── queries.js             # CRUD + агрегации
├── validation.js          # JSON Schema валидация
├── docker-compose.yml
└── README.md
```

---

## ⚡ Быстрый старт

### 1. Запуск через Docker

```bash
docker compose up --build
```

📍 Сервисы:

* MongoDB → `localhost:27017`
* API → `http://localhost:8000`

---

### 2. Документация API

Откройте Swagger:

```
http://localhost:8000/docs
```

---

## 🧪 Ручной запуск (опционально)

```bash
# Загрузка тестовых данных
mongosh fitness_tracker data.js

# Применение схем валидации
mongosh fitness_tracker validation.js

# Выполнение запросов
mongosh fitness_tracker queries.js
```

---

## 🔗 API Endpoints

| Метод | URL                          | Описание                   |
| ----- | ---------------------------- | -------------------------- |
| POST  | `/users`                     | Создать пользователя       |
| GET   | `/users/by-login/{login}`    | Найти по логину            |
| GET   | `/users/search`              | Поиск по имени/фамилии     |
| POST  | `/exercises`                 | Создать упражнение         |
| GET   | `/exercises`                 | Получить список упражнений |
| POST  | `/workouts`                  | Создать тренировку         |
| POST  | `/workouts/{id}/exercises`   | Добавить упражнение        |
| GET   | `/users/{id}/workouts`       | История тренировок         |
| GET   | `/users/{id}/workouts/stats` | Статистика                 |
| GET   | `/health`                    | Проверка сервиса           |

---

## 📸 Примеры API

### ➕ Создать пользователя

```bash
curl -X POST http://localhost:8000/users \
-H "Content-Type: application/json" \
-d '{"login":"ivan_petrov","first_name":"Ivan","last_name":"Petrov",
"email":"ivan@example.com","age":27,"weight_kg":75.0,"height_cm":178}'
```

<img src="images/add_user.png" width="600"/>

---

### 🔍 Найти по логину

```bash
curl http://localhost:8000/users/by-login/ivan_petrov
```

<img src="images/get_user_by_login.png" width="600"/>

---

### 🔎 Поиск пользователей

```bash
curl "http://localhost:8000/users/search?first_name=Iv&last_name=Pet"
```

<img src="images/get_user_flname.png" width="600"/>

---

### 🏋️ Упражнения по категории

```bash
curl "http://localhost:8000/exercises?category=strength"
```

<img src="images/category.png" width="600"/>

---

### ➕ Создать упражнение

```bash
curl -X POST http://localhost:8000/exercises \
-H "Content-Type: application/json" \
-d '{"name":"Box Jump","category":"cardio","muscle_groups":["legs"],"difficulty":"intermediate"}'
```

<img src="images/add_exercises.png" width="600"/>

---

### 📅 История тренировок

```bash
curl http://localhost:8000/users/<user_id>/workouts
```

<img src="images/workout_user_id.png" width="600"/>

---

### 📊 Статистика тренировок

```bash
curl "http://localhost:8000/users/<user_id>/workouts/stats?from_date=2024-04-01T00:00:00&to_date=2024-04-30T23:59:59"
```

<img src="images/get_workouts_period.png" width="600"/>

---

## 🗄️ Коллекции MongoDB

| Коллекция | Кол-во документов | Основные поля              |
| --------- | ----------------- | -------------------------- |
| users     | 10                | login, email, age          |
| exercises | 12                | name, category, difficulty |
| workouts  | 12                | user_id, date, exercises[] |

📄 Подробнее: `schema_design.md`

---

## 🛡️ Валидация схем

Реализована через `$jsonSchema`:

* **users**

  * обязательные поля
  * проверка login и email (regex)
  * диапазоны значений

* **exercises**

  * enum значения
  * минимум 1 группа мышц

* **workouts**

  * ссылка на пользователя
  * вложенная валидация exercises[]

---

## 🐳 Docker

Запуск всего проекта:

```bash
docker compose up --build
```

---

## 👨‍💻 Автор

Kasem Alkhalaf
