// queries.js — MongoDB CRUD-запросы для Fitness Tracker
// Запуск: mongosh fitness_tracker queries.js

// ═══════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════

// 1. Создание нового пользователя
db.users.insertOne({
  login: "new_user",
  first_name: "New",
  last_name: "User",
  email: "new.user@example.com",
  age: 24,
  weight_kg: 70.0,
  height_cm: 172,
  created_at: new Date(),
});

// 2. Создание упражнения
db.exercises.insertOne({
  name: "Dumbbell Curl",
  category: "strength",
  muscle_groups: ["biceps", "forearms"],
  description: "Isolation exercise for the biceps using dumbbells.",
  equipment: "dumbbells",
  difficulty: "beginner",
  created_at: new Date(),
});

// 3. Создание тренировки
const userId = db.users.findOne({ login: "john_doe" })._id;
const squatId = db.exercises.findOne({ name: "Barbell Squat" })._id;
db.workouts.insertOne({
  user_id: userId,
  title: "New Workout",
  date: new Date("2024-04-10"),
  duration_minutes: 45,
  notes: "Light recovery",
  exercises: [
    {
      exercise_id: squatId,
      exercise_name: "Barbell Squat",
      sets: 3,
      reps: 10,
      weight_kg: 80,
      duration_seconds: null,
      order: 1,
    },
  ],
  created_at: new Date(),
});

// ═══════════════════════════════════════════════════════════════
// READ
// ═══════════════════════════════════════════════════════════════

// 4. Поиск пользователя по логину ($eq)
db.users.findOne({ login: { $eq: "john_doe" } });

// 5. Поиск пользователя по маске имени и фамилии ($regex, $and)
db.users.find({
  $and: [
    { first_name: { $regex: "Jo", $options: "i" } },
    { last_name: { $regex: "D", $options: "i" } },
  ],
});

// 6. Получение списка всех упражнений
db.exercises.find({}).sort({ name: 1 });

// 7. Получение упражнений по категории ($in)
db.exercises.find({ category: { $in: ["cardio", "balance"] } });

// 8. Пользователи с возрастом больше 30 ($gt)
db.users.find({ age: { $gt: 30 } });

// 9. История тренировок пользователя (сортировка по дате)
const uid = db.users.findOne({ login: "john_doe" })._id;
db.workouts.find({ user_id: uid }).sort({ date: -1 });

// 10. Тренировки за период ($gte, $lte)
db.workouts.find({
  user_id: uid,
  date: {
    $gte: new Date("2024-04-01"),
    $lte: new Date("2024-04-30"),
  },
});

// 11. Тренировки длительностью более 50 минут ($gt)
db.workouts.find({ duration_minutes: { $gt: 50 } });

// 12. Тренировки с конкретным упражнением (поиск в массиве)
const benchId = db.exercises.findOne({ name: "Bench Press" })._id;
db.workouts.find({ "exercises.exercise_id": benchId });

// 13. Пользователи НЕ из определённого возраста ($ne, $nin)
db.users.find({ age: { $nin: [22, 25, 28] } });

// 14. Сложный OR: упражнения для ног или спины ($or, $in)
db.exercises.find({
  $or: [
    { muscle_groups: { $in: ["legs", "quadriceps"] } },
    { muscle_groups: { $in: ["back"] } },
  ],
});

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

// 15. Обновление данных пользователя ($set)
db.users.updateOne(
  { login: "john_doe" },
  { $set: { weight_kg: 81.0, age: 29 } }
);

// 16. Добавление упражнения в существующую тренировку ($push)
const workoutId = db.workouts.findOne({ title: "Leg Day" })._id;
const lungesId = db.exercises.findOne({ name: "Lunges" })._id;
db.workouts.updateOne(
  { _id: workoutId },
  {
    $push: {
      exercises: {
        exercise_id: lungesId,
        exercise_name: "Lunges",
        sets: 3,
        reps: 15,
        weight_kg: 0,
        duration_seconds: null,
        order: 3,
      },
    },
  }
);

// 17. Удаление упражнения из тренировки ($pull)
db.workouts.updateOne(
  { _id: workoutId },
  { $pull: { exercises: { exercise_name: "Lunges" } } }
);

// 18. Увеличение продолжительности тренировки ($inc)
db.workouts.updateOne({ _id: workoutId }, { $inc: { duration_minutes: 5 } });

// 19. Обновление нескольких документов ($set + updateMany)
db.workouts.updateMany(
  { duration_minutes: { $lt: 30 } },
  { $set: { notes: "Short session" } }
);

// 20. Добавить тег если ещё нет ($addToSet)
db.exercises.updateOne(
  { name: "Push-Up" },
  { $addToSet: { muscle_groups: "core" } }
);

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

// 21. Удаление пользователя по логину
db.users.deleteOne({ login: "new_user" });

// 22. Удаление тренировок пользователя за период
db.workouts.deleteMany({
  user_id: uid,
  date: { $lt: new Date("2024-01-01") },
});

// 23. Удаление упражнения по имени
db.exercises.deleteOne({ name: "Dumbbell Curl" });

// ═══════════════════════════════════════════════════════════════
// AGGREGATION — Статистика тренировок за период
// ═══════════════════════════════════════════════════════════════

// 24. Статистика тренировок пользователя за апрель 2024
db.workouts.aggregate([
  // Фильтрация по пользователю и периоду
  {
    $match: {
      user_id: uid,
      date: {
        $gte: new Date("2024-04-01"),
        $lte: new Date("2024-04-30"),
      },
    },
  },
  // Разворачиваем массив упражнений
  { $unwind: "$exercises" },
  // Группируем и считаем метрики
  {
    $group: {
      _id: "$user_id",
      total_workouts: { $sum: 1 },
      total_duration_minutes: { $sum: "$duration_minutes" },
      avg_duration_minutes: { $avg: "$duration_minutes" },
      total_sets: { $sum: "$exercises.sets" },
      unique_exercises: { $addToSet: "$exercises.exercise_name" },
    },
  },
  // Формируем итоговый документ
  {
    $project: {
      _id: 0,
      total_workouts: 1,
      total_duration_minutes: 1,
      avg_duration_minutes: { $round: ["$avg_duration_minutes", 1] },
      total_sets: 1,
      unique_exercise_count: { $size: "$unique_exercises" },
    },
  },
]);

// 25. Топ упражнений по количеству использований
db.workouts.aggregate([
  { $unwind: "$exercises" },
  {
    $group: {
      _id: "$exercises.exercise_name",
      usage_count: { $sum: 1 },
      avg_sets: { $avg: "$exercises.sets" },
    },
  },
  { $sort: { usage_count: -1 } },
  { $limit: 5 },
  {
    $project: {
      exercise_name: "$_id",
      _id: 0,
      usage_count: 1,
      avg_sets: { $round: ["$avg_sets", 1] },
    },
  },
]);
