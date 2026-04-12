// data.js — Тестовые данные для фитнес-трекера
// Запуск: mongosh fitness_tracker data.js

// ─── Очистка ────────────────────────────────────────────────────────────────
db.users.drop();
db.exercises.drop();
db.workouts.drop();

// ─── Упражнения (справочник) ─────────────────────────────────────────────────
db.exercises.insertMany([
  {
    name: "Приседания",
    category: "strength",
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    description: "Базовое упражнение для нижней части тела",
    unit: "reps",
    defaultSets: 4,
    defaultReps: 12,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Жим лёжа",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    description: "Базовое упражнение для верхней части тела",
    unit: "reps",
    defaultSets: 4,
    defaultReps: 8,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Подтягивания",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    description: "Упражнение с собственным весом для спины",
    unit: "reps",
    defaultSets: 3,
    defaultReps: 10,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Бег",
    category: "cardio",
    muscleGroups: ["legs", "core"],
    description: "Кардио нагрузка, улучшает выносливость",
    unit: "meters",
    defaultSets: 1,
    defaultReps: 1,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Планка",
    category: "strength",
    muscleGroups: ["core", "shoulders"],
    description: "Статическое упражнение для укрепления кора",
    unit: "seconds",
    defaultSets: 3,
    defaultReps: 1,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Становая тяга",
    category: "strength",
    muscleGroups: ["back", "glutes", "hamstrings"],
    description: "Комплексное базовое упражнение",
    unit: "reps",
    defaultSets: 4,
    defaultReps: 6,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Велотренажёр",
    category: "cardio",
    muscleGroups: ["legs", "core"],
    description: "Кардио нагрузка с низкой ударной нагрузкой",
    unit: "seconds",
    defaultSets: 1,
    defaultReps: 1,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Отжимания",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    description: "Упражнение с собственным весом для груди",
    unit: "reps",
    defaultSets: 3,
    defaultReps: 15,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Выпады",
    category: "strength",
    muscleGroups: ["quadriceps", "glutes"],
    description: "Упражнение для ног и ягодиц",
    unit: "reps",
    defaultSets: 3,
    defaultReps: 12,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Растяжка хамстрингов",
    category: "flexibility",
    muscleGroups: ["hamstrings"],
    description: "Статическая растяжка задней поверхности бедра",
    unit: "seconds",
    defaultSets: 2,
    defaultReps: 1,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Скручивания",
    category: "strength",
    muscleGroups: ["core", "abs"],
    description: "Упражнение для пресса",
    unit: "reps",
    defaultSets: 3,
    defaultReps: 20,
    createdAt: new Date("2024-01-01")
  }
]);

print("✅ Упражнения добавлены: " + db.exercises.countDocuments());

// ─── Получаем ID упражнений ──────────────────────────────────────────────────
const squat      = db.exercises.findOne({ name: "Приседания" })._id;
const benchPress = db.exercises.findOne({ name: "Жим лёжа" })._id;
const pullUp     = db.exercises.findOne({ name: "Подтягивания" })._id;
const running    = db.exercises.findOne({ name: "Бег" })._id;
const plank      = db.exercises.findOne({ name: "Планка" })._id;
const deadlift   = db.exercises.findOne({ name: "Становая тяга" })._id;
const bike       = db.exercises.findOne({ name: "Велотренажёр" })._id;
const pushUp     = db.exercises.findOne({ name: "Отжимания" })._id;
const lunges     = db.exercises.findOne({ name: "Выпады" })._id;

// ─── Пользователи ────────────────────────────────────────────────────────────
db.users.insertMany([
  {
    login: "ivan_petrov",
    firstName: "Иван",
    lastName: "Петров",
    email: "ivan.petrov@example.com",
    passwordHash: "$2b$10$examplehash1",
    age: 28,
    weight: 80,
    height: 180,
    goal: "muscle_gain",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    login: "maria_sidorova",
    firstName: "Мария",
    lastName: "Сидорова",
    email: "maria.s@example.com",
    passwordHash: "$2b$10$examplehash2",
    age: 24,
    weight: 58,
    height: 165,
    goal: "weight_loss",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01")
  },
  {
    login: "alexey_k",
    firstName: "Алексей",
    lastName: "Козлов",
    email: "alexey.k@example.com",
    passwordHash: "$2b$10$examplehash3",
    age: 35,
    weight: 90,
    height: 185,
    goal: "endurance",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    login: "elena_nova",
    firstName: "Елена",
    lastName: "Новикова",
    email: "elena.nova@example.com",
    passwordHash: "$2b$10$examplehash4",
    age: 30,
    weight: 65,
    height: 170,
    goal: "flexibility",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01")
  },
  {
    login: "dmitry_vol",
    firstName: "Дмитрий",
    lastName: "Волков",
    email: "dmitry.vol@example.com",
    passwordHash: "$2b$10$examplehash5",
    age: 22,
    weight: 70,
    height: 175,
    goal: "muscle_gain",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10")
  }
]);

print("✅ Пользователи добавлены: " + db.users.countDocuments());

// ─── Получаем ID пользователей ───────────────────────────────────────────────
const user1 = db.users.findOne({ login: "ivan_petrov" })._id;
const user2 = db.users.findOne({ login: "maria_sidorova" })._id;
const user3 = db.users.findOne({ login: "alexey_k" })._id;
const user4 = db.users.findOne({ login: "elena_nova" })._id;
const user5 = db.users.findOne({ login: "dmitry_vol" })._id;

// ─── Тренировки ──────────────────────────────────────────────────────────────
db.workouts.insertMany([
  // Иван — тренировки на силу
  {
    userId: user1,
    title: "Грудь и трицепс",
    date: new Date("2024-03-01"),
    durationMinutes: 60,
    notes: "Хорошая тренировка, добавил вес на жиме",
    exercises: [
      { exerciseId: benchPress, sets: 4, reps: 8, weight: 80, completed: true },
      { exerciseId: pushUp, sets: 3, reps: 20, weight: 0, completed: true },
      { exerciseId: plank, sets: 3, reps: 1, duration: 60, completed: true }
    ],
    totalCaloriesBurned: 350,
    heartRateAvg: 130,
    createdAt: new Date("2024-03-01")
  },
  {
    userId: user1,
    title: "Ноги",
    date: new Date("2024-03-04"),
    durationMinutes: 75,
    notes: "Тяжёлые приседания, хорошее ощущение",
    exercises: [
      { exerciseId: squat, sets: 4, reps: 10, weight: 100, completed: true },
      { exerciseId: deadlift, sets: 4, reps: 6, weight: 120, completed: true },
      { exerciseId: lunges, sets: 3, reps: 12, weight: 20, completed: false }
    ],
    totalCaloriesBurned: 500,
    heartRateAvg: 145,
    createdAt: new Date("2024-03-04")
  },
  {
    userId: user1,
    title: "Спина и бицепс",
    date: new Date("2024-03-07"),
    durationMinutes: 55,
    exercises: [
      { exerciseId: pullUp, sets: 4, reps: 8, weight: 0, completed: true },
      { exerciseId: deadlift, sets: 3, reps: 5, weight: 130, completed: true }
    ],
    totalCaloriesBurned: 380,
    heartRateAvg: 135,
    createdAt: new Date("2024-03-07")
  },
  // Мария — кардио и похудение
  {
    userId: user2,
    title: "Утренняя пробежка",
    date: new Date("2024-03-02"),
    durationMinutes: 40,
    notes: "5 км за 28 минут",
    exercises: [
      { exerciseId: running, sets: 1, reps: 1, distance: 5000, completed: true }
    ],
    totalCaloriesBurned: 280,
    heartRateAvg: 155,
    createdAt: new Date("2024-03-02")
  },
  {
    userId: user2,
    title: "Кардио + пресс",
    date: new Date("2024-03-05"),
    durationMinutes: 50,
    exercises: [
      { exerciseId: bike, sets: 1, reps: 1, duration: 1800, completed: true },
      { exerciseId: plank, sets: 3, reps: 1, duration: 45, completed: true }
    ],
    totalCaloriesBurned: 320,
    heartRateAvg: 148,
    createdAt: new Date("2024-03-05")
  },
  // Алексей — выносливость
  {
    userId: user3,
    title: "Длинная пробежка",
    date: new Date("2024-03-01"),
    durationMinutes: 90,
    notes: "10 км в умеренном темпе",
    exercises: [
      { exerciseId: running, sets: 1, reps: 1, distance: 10000, completed: true }
    ],
    totalCaloriesBurned: 700,
    heartRateAvg: 160,
    createdAt: new Date("2024-03-01")
  },
  {
    userId: user3,
    title: "Велотренировка",
    date: new Date("2024-03-03"),
    durationMinutes: 60,
    exercises: [
      { exerciseId: bike, sets: 1, reps: 1, duration: 3600, completed: true }
    ],
    totalCaloriesBurned: 450,
    heartRateAvg: 145,
    createdAt: new Date("2024-03-03")
  },
  // Елена — гибкость
  {
    userId: user4,
    title: "Растяжка и йога",
    date: new Date("2024-03-02"),
    durationMinutes: 45,
    exercises: [
      { exerciseId: plank, sets: 2, reps: 1, duration: 30, completed: true }
    ],
    totalCaloriesBurned: 120,
    heartRateAvg: 90,
    createdAt: new Date("2024-03-02")
  },
  // Дмитрий — начинающий
  {
    userId: user5,
    title: "Первая тренировка",
    date: new Date("2024-03-01"),
    durationMinutes: 30,
    notes: "Начало пути!",
    exercises: [
      { exerciseId: pushUp, sets: 3, reps: 10, weight: 0, completed: true },
      { exerciseId: squat, sets: 3, reps: 15, weight: 0, completed: true }
    ],
    totalCaloriesBurned: 200,
    heartRateAvg: 125,
    createdAt: new Date("2024-03-01")
  },
  {
    userId: user5,
    title: "Тренировка 2",
    date: new Date("2024-03-04"),
    durationMinutes: 35,
    exercises: [
      { exerciseId: pushUp, sets: 3, reps: 12, weight: 0, completed: true },
      { exerciseId: plank, sets: 3, reps: 1, duration: 40, completed: true },
      { exerciseId: lunges, sets: 3, reps: 10, weight: 0, completed: true }
    ],
    totalCaloriesBurned: 230,
    heartRateAvg: 128,
    createdAt: new Date("2024-03-04")
  },
  {
    userId: user1,
    title: "Ноги (повтор)",
    date: new Date("2024-03-11"),
    durationMinutes: 80,
    exercises: [
      { exerciseId: squat, sets: 5, reps: 8, weight: 105, completed: true },
      { exerciseId: deadlift, sets: 4, reps: 5, weight: 125, completed: true }
    ],
    totalCaloriesBurned: 520,
    heartRateAvg: 150,
    createdAt: new Date("2024-03-11")
  }
]);

print("✅ Тренировки добавлены: " + db.workouts.countDocuments());

// ─── Индексы ─────────────────────────────────────────────────────────────────
db.users.createIndex({ login: 1 }, { unique: true });
db.users.createIndex({ firstName: 1, lastName: 1 });
db.exercises.createIndex({ name: 1 }, { unique: true });
db.exercises.createIndex({ category: 1 });
db.workouts.createIndex({ userId: 1, date: -1 });

print("✅ Индексы созданы");
print("\n🎉 База данных успешно инициализирована!");
