// validation.js — Валидация схем MongoDB для фитнес-трекера
// Запуск: mongosh fitness_tracker validation.js

// ════════════════════════════════════════════════════════════════════
// Валидация коллекции users
// ════════════════════════════════════════════════════════════════════

db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["login", "firstName", "lastName", "email", "passwordHash", "goal", "createdAt"],
      additionalProperties: true,
      properties: {
        login: {
          bsonType: "string",
          minLength: 3,
          maxLength: 50,
          pattern: "^[a-z0-9_]+$",
          description: "Логин: только строчные буквы, цифры и подчёркивание, 3-50 символов"
        },
        firstName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "Имя обязательно"
        },
        lastName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "Фамилия обязательна"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Корректный email адрес"
        },
        passwordHash: {
          bsonType: "string",
          minLength: 10,
          description: "Хэш пароля, минимум 10 символов"
        },
        age: {
          bsonType: "int",
          minimum: 10,
          maximum: 120,
          description: "Возраст от 10 до 120 лет"
        },
        weight: {
          bsonType: "double",
          minimum: 20,
          maximum: 500,
          description: "Вес в кг: от 20 до 500"
        },
        height: {
          bsonType: "double",
          minimum: 50,
          maximum: 300,
          description: "Рост в см: от 50 до 300"
        },
        goal: {
          bsonType: "string",
          enum: ["weight_loss", "muscle_gain", "endurance", "flexibility"],
          description: "Цель тренировок — одно из допустимых значений"
        },
        createdAt: {
          bsonType: "date",
          description: "Дата создания обязательна"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Валидация users установлена");

// ════════════════════════════════════════════════════════════════════
// Валидация коллекции exercises
// ════════════════════════════════════════════════════════════════════

db.runCommand({
  collMod: "exercises",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category", "muscleGroups", "unit", "createdAt"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 200,
          description: "Название упражнения обязательно"
        },
        category: {
          bsonType: "string",
          enum: ["cardio", "strength", "flexibility", "balance"],
          description: "Категория — одно из: cardio, strength, flexibility, balance"
        },
        muscleGroups: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "string"
          },
          description: "Минимум одна группа мышц"
        },
        description: {
          bsonType: "string",
          maxLength: 1000
        },
        unit: {
          bsonType: "string",
          enum: ["reps", "seconds", "meters"],
          description: "Единица измерения: reps, seconds или meters"
        },
        defaultSets: {
          bsonType: "int",
          minimum: 1,
          maximum: 20
        },
        defaultReps: {
          bsonType: "int",
          minimum: 1,
          maximum: 1000
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Валидация exercises установлена");

// ════════════════════════════════════════════════════════════════════
// Валидация коллекции workouts
// ════════════════════════════════════════════════════════════════════

db.runCommand({
  collMod: "workouts",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "title", "date", "exercises", "createdAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "Ссылка на пользователя обязательна"
        },
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200,
          description: "Название тренировки обязательно"
        },
        date: {
          bsonType: "date",
          description: "Дата тренировки обязательна"
        },
        durationMinutes: {
          bsonType: "int",
          minimum: 1,
          maximum: 600,
          description: "Длительность: от 1 до 600 минут"
        },
        notes: {
          bsonType: "string",
          maxLength: 2000
        },
        exercises: {
          bsonType: "array",
          minItems: 1,
          description: "Минимум одно упражнение в тренировке",
          items: {
            bsonType: "object",
            required: ["exerciseId", "sets", "completed"],
            properties: {
              exerciseId: { bsonType: "objectId" },
              sets: {
                bsonType: "int",
                minimum: 1,
                maximum: 100
              },
              reps: {
                bsonType: "int",
                minimum: 0,
                maximum: 10000
              },
              weight: {
                bsonType: "double",
                minimum: 0,
                maximum: 1000
              },
              duration: {
                bsonType: "int",
                minimum: 0
              },
              distance: {
                bsonType: "double",
                minimum: 0
              },
              completed: {
                bsonType: "bool"
              }
            }
          }
        },
        totalCaloriesBurned: {
          bsonType: "int",
          minimum: 0,
          maximum: 10000
        },
        heartRateAvg: {
          bsonType: "int",
          minimum: 30,
          maximum: 250
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Валидация workouts установлена");

// ════════════════════════════════════════════════════════════════════
// Тесты валидации — вставка невалидных данных (должна вызвать ошибку)
// ════════════════════════════════════════════════════════════════════

print("\n--- Тестирование валидации ---");

// Тест 1: Неверный email
try {
  db.users.insertOne({
    login: "test_user",
    firstName: "Тест",
    lastName: "Тестов",
    email: "not-an-email",  // ❌ Неверный формат
    passwordHash: "$2b$10$testhash123",
    goal: "endurance",
    createdAt: new Date()
  });
  print("❌ Тест 1 ПРОВАЛЕН: вставка прошла, должна была упасть");
} catch (e) {
  print("✅ Тест 1 ПРОШЁЛ: невалидный email отклонён — " + e.message.slice(0, 60));
}

// Тест 2: Неверная цель (goal)
try {
  db.users.insertOne({
    login: "test_user2",
    firstName: "Тест",
    lastName: "Два",
    email: "test2@example.com",
    passwordHash: "$2b$10$testhash456",
    goal: "flying",  // ❌ Не из enum
    createdAt: new Date()
  });
  print("❌ Тест 2 ПРОВАЛЕН");
} catch (e) {
  print("✅ Тест 2 ПРОШЁЛ: неверная цель отклонена — " + e.message.slice(0, 60));
}

// Тест 3: Возраст вне диапазона
try {
  db.users.insertOne({
    login: "test_user3",
    firstName: "Тест",
    lastName: "Три",
    email: "test3@example.com",
    passwordHash: "$2b$10$testhash789",
    age: 5,  // ❌ Меньше 10
    goal: "endurance",
    createdAt: new Date()
  });
  print("❌ Тест 3 ПРОВАЛЕН");
} catch (e) {
  print("✅ Тест 3 ПРОШЁЛ: недопустимый возраст отклонён — " + e.message.slice(0, 60));
}

// Тест 4: Упражнение без обязательного поля
try {
  db.exercises.insertOne({
    name: "Тестовое упражнение",
    // ❌ Отсутствует category, muscleGroups, unit
    createdAt: new Date()
  });
  print("❌ Тест 4 ПРОВАЛЕН");
} catch (e) {
  print("✅ Тест 4 ПРОШЁЛ: отсутствующие поля отклонены — " + e.message.slice(0, 60));
}

// Тест 5: Тренировка с пустым массивом упражнений
try {
  db.workouts.insertOne({
    userId: new ObjectId(),
    title: "Пустая тренировка",
    date: new Date(),
    exercises: [],  // ❌ Минимум 1 упражнение
    createdAt: new Date()
  });
  print("❌ Тест 5 ПРОВАЛЕН");
} catch (e) {
  print("✅ Тест 5 ПРОШЁЛ: пустой массив упражнений отклонён — " + e.message.slice(0, 60));
}

// Тест 6: Неверная категория упражнения
try {
  db.exercises.insertOne({
    name: "Левитация",
    category: "magic",  // ❌ Не из enum
    muscleGroups: ["air"],
    unit: "reps",
    createdAt: new Date()
  });
  print("❌ Тест 6 ПРОВАЛЕН");
} catch (e) {
  print("✅ Тест 6 ПРОШЁЛ: неверная категория отклонена — " + e.message.slice(0, 60));
}

print("\n✅ Тестирование валидации завершено!");
