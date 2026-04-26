// validation.js — JSON Schema валидация коллекций Fitness Tracker
// Запуск: mongosh fitness_tracker validation.js

// ── Users валидация ───────────────────────────────────────────────────────────
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["login", "first_name", "last_name", "email", "age", "created_at"],
      additionalProperties: true,
      properties: {
        login: {
          bsonType: "string",
          minLength: 3,
          maxLength: 50,
          pattern: "^[a-z0-9_]+$",
          description: "Unique login: 3-50 chars, lowercase letters, digits, underscore only",
        },
        first_name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "First name is required",
        },
        last_name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "Last name is required",
        },
        email: {
          bsonType: "string",
          pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
          description: "Must be a valid email address",
        },
        age: {
          bsonType: "int",
          minimum: 10,
          maximum: 120,
          description: "Age must be between 10 and 120",
        },
        weight_kg: {
          bsonType: ["double", "null"],
          minimum: 20,
          maximum: 500,
          description: "Weight in kg (optional)",
        },
        height_cm: {
          bsonType: ["int", "null"],
          minimum: 50,
          maximum: 300,
          description: "Height in cm (optional)",
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp is required",
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});
print("✓ Users validator applied");

// ── Exercises валидация ───────────────────────────────────────────────────────
db.runCommand({
  collMod: "exercises",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category", "muscle_groups", "difficulty", "created_at"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Exercise name is required",
        },
        category: {
          bsonType: "string",
          enum: ["cardio", "strength", "flexibility", "balance"],
          description: "Must be one of: cardio, strength, flexibility, balance",
        },
        muscle_groups: {
          bsonType: "array",
          minItems: 1,
          items: { bsonType: "string" },
          description: "At least one muscle group required",
        },
        description: {
          bsonType: ["string", "null"],
          maxLength: 500,
        },
        equipment: {
          bsonType: ["string", "null"],
          maxLength: 100,
        },
        difficulty: {
          bsonType: "string",
          enum: ["beginner", "intermediate", "advanced"],
          description: "Must be one of: beginner, intermediate, advanced",
        },
        created_at: {
          bsonType: "date",
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});
print("✓ Exercises validator applied");

// ── Workouts валидация ────────────────────────────────────────────────────────
db.runCommand({
  collMod: "workouts",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "title", "date", "duration_minutes", "exercises"],
      properties: {
        user_id: {
          bsonType: "objectId",
          description: "Reference to user is required",
        },
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200,
        },
        date: {
          bsonType: "date",
        },
        duration_minutes: {
          bsonType: "int",
          minimum: 1,
          maximum: 600,
          description: "Duration must be between 1 and 600 minutes",
        },
        notes: {
          bsonType: ["string", "null"],
          maxLength: 1000,
        },
        exercises: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["exercise_id", "exercise_name", "sets", "order"],
            properties: {
              exercise_id: { bsonType: "objectId" },
              exercise_name: { bsonType: "string", minLength: 1 },
              sets: { bsonType: "int", minimum: 1, maximum: 100 },
              reps: { bsonType: ["int", "null"], minimum: 1 },
              weight_kg: { bsonType: ["double", "null"], minimum: 0 },
              duration_seconds: { bsonType: ["int", "null"], minimum: 1 },
              order: { bsonType: "int", minimum: 1 },
            },
          },
        },
        created_at: {
          bsonType: "date",
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});
print("✓ Workouts validator applied");

// ═══════════════════════════════════════════════════════════════════════════════
// ТЕСТЫ ВАЛИДАЦИИ
// ═══════════════════════════════════════════════════════════════════════════════

print("\n--- Testing validation ---");

// ❌ Тест 1: Невалидный login (содержит заглавные буквы)
try {
  db.users.insertOne({
    login: "BadLogin",   // нарушение pattern ^[a-z0-9_]+$
    first_name: "Test",
    last_name: "User",
    email: "test@test.com",
    age: 25,
    created_at: new Date(),
  });
  print("FAIL: Should have rejected uppercase login");
} catch (e) {
  print("✓ Correctly rejected invalid login: " + e.message.substring(0, 80));
}

// ❌ Тест 2: Возраст вне допустимого диапазона
try {
  db.users.insertOne({
    login: "valid_login",
    first_name: "Test",
    last_name: "User",
    email: "test@test.com",
    age: 5,   // minimum = 10
    created_at: new Date(),
  });
  print("FAIL: Should have rejected age < 10");
} catch (e) {
  print("✓ Correctly rejected age < 10: " + e.message.substring(0, 80));
}

// ❌ Тест 3: Неверная категория упражнения
try {
  db.exercises.insertOne({
    name: "Invalid Exercise",
    category: "unknown",   // не в enum
    muscle_groups: ["arms"],
    difficulty: "beginner",
    created_at: new Date(),
  });
  print("FAIL: Should have rejected unknown category");
} catch (e) {
  print("✓ Correctly rejected unknown category: " + e.message.substring(0, 80));
}

// ❌ Тест 4: Тренировка без обязательного поля title
try {
  db.workouts.insertOne({
    user_id: db.users.findOne()._id,
    date: new Date(),
    duration_minutes: 30,
    exercises: [],
    created_at: new Date(),
  });
  print("FAIL: Should have rejected missing title");
} catch (e) {
  print("✓ Correctly rejected missing title: " + e.message.substring(0, 80));
}

// ✅ Тест 5: Валидная вставка
try {
  db.users.insertOne({
    login: "valid_test_user",
    first_name: "Valid",
    last_name: "User",
    email: "valid@test.com",
    age: 25,
    weight_kg: 70.0,
    height_cm: 175,
    created_at: new Date(),
  });
  print("✓ Valid user inserted successfully");
  db.users.deleteOne({ login: "valid_test_user" });
} catch (e) {
  print("FAIL: Valid user was rejected: " + e.message);
}

print("\nValidation tests complete.");
