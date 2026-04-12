// queries.js — MongoDB запросы для фитнес-трекера
// Запуск: mongosh fitness_tracker queries.js

// ════════════════════════════════════════════════════════════════════
// CREATE — Вставка документов
// ════════════════════════════════════════════════════════════════════

// 1. Создание нового пользователя
db.users.insertOne({
  login: "new_user_2024",
  firstName: "Сергей",
  lastName: "Морозов",
  email: "sergey.morozov@example.com",
  passwordHash: "$2b$10$newhash",
  age: 27,
  weight: 75,
  height: 178,
  goal: "muscle_gain",
  createdAt: new Date(),
  updatedAt: new Date()
});

// 2. Создание нового упражнения
db.exercises.insertOne({
  name: "Тяга верхнего блока",
  category: "strength",
  muscleGroups: ["back", "biceps", "lats"],
  description: "Упражнение для широчайших мышц спины",
  unit: "reps",
  defaultSets: 3,
  defaultReps: 12,
  createdAt: new Date()
});

// 3. Создание тренировки
const userId = db.users.findOne({ login: "ivan_petrov" })._id;
const squatId = db.exercises.findOne({ name: "Приседания" })._id;
const deadliftId = db.exercises.findOne({ name: "Становая тяга" })._id;

db.workouts.insertOne({
  userId: userId,
  title: "Силовая тренировка",
  date: new Date(),
  durationMinutes: 65,
  notes: "Новая тренировка",
  exercises: [
    { exerciseId: squatId, sets: 4, reps: 10, weight: 90, completed: false },
    { exerciseId: deadliftId, sets: 3, reps: 6, weight: 110, completed: false }
  ],
  totalCaloriesBurned: 0,
  createdAt: new Date()
});

// ════════════════════════════════════════════════════════════════════
// READ — Поиск документов
// ════════════════════════════════════════════════════════════════════

// 4. Поиск пользователя по логину (точное совпадение)
db.users.findOne({ login: "ivan_petrov" });

// 5. Поиск пользователей по маске имени и фамилии (regex)
db.users.find({
  $or: [
    { firstName: { $regex: "Ив", $options: "i" } },
    { lastName: { $regex: "Пет", $options: "i" } }
  ]
});

// 6. Поиск по маске полного имени (firstName + lastName)
db.users.find({
  $and: [
    { firstName: { $regex: "^М", $options: "i" } },
    { lastName: { $regex: "а$", $options: "i" } }
  ]
});

// 7. Получение всех упражнений
db.exercises.find({}).sort({ name: 1 });

// 8. Упражнения по категории
db.exercises.find({ category: { $in: ["strength", "cardio"] } });

// 9. История тренировок пользователя (сортировка по дате)
db.workouts.find(
  { userId: db.users.findOne({ login: "ivan_petrov" })._id },
  { title: 1, date: 1, durationMinutes: 1, totalCaloriesBurned: 1 }
).sort({ date: -1 });

// 10. Тренировки за период (статистика)
const periodStart = new Date("2024-03-01");
const periodEnd   = new Date("2024-03-31");

db.workouts.find({
  userId: db.users.findOne({ login: "ivan_petrov" })._id,
  date: { $gte: periodStart, $lte: periodEnd }
}).sort({ date: 1 });

// 11. Тренировки длиннее 60 минут
db.workouts.find({ durationMinutes: { $gt: 60 } });

// 12. Тренировки, где есть конкретное упражнение
db.workouts.find({
  "exercises.exerciseId": db.exercises.findOne({ name: "Приседания" })._id
});

// 13. Тренировки, где сожжено более 400 калорий
db.workouts.find({ totalCaloriesBurned: { $gt: 400 } });

// ════════════════════════════════════════════════════════════════════
// UPDATE — Обновление документов
// ════════════════════════════════════════════════════════════════════

// 14. Обновление веса пользователя
db.users.updateOne(
  { login: "ivan_petrov" },
  {
    $set: { weight: 82, updatedAt: new Date() }
  }
);

// 15. Добавление упражнения в тренировку ($push)
const workoutId = db.workouts.findOne(
  { userId: db.users.findOne({ login: "ivan_petrov" })._id, title: "Грудь и трицепс" }
)._id;

db.workouts.updateOne(
  { _id: workoutId },
  {
    $push: {
      exercises: {
        exerciseId: db.exercises.findOne({ name: "Тяга верхнего блока" })._id,
        sets: 3,
        reps: 12,
        weight: 50,
        completed: false
      }
    }
  }
);

// 16. Отметить упражнение выполненным ($set в массиве)
db.workouts.updateOne(
  { _id: workoutId, "exercises.exerciseId": squatId },
  { $set: { "exercises.$.completed": true } }
);

// 17. Обновить калории и пульс тренировки
db.workouts.updateOne(
  { _id: workoutId },
  { $set: { totalCaloriesBurned: 420, heartRateAvg: 138 } }
);

// 18. Добавить группу мышц к упражнению ($addToSet — без дублей)
db.exercises.updateOne(
  { name: "Планка" },
  { $addToSet: { muscleGroups: "glutes" } }
);

// 19. Удалить группу мышц ($pull)
db.exercises.updateOne(
  { name: "Планка" },
  { $pull: { muscleGroups: "glutes" } }
);

// 20. Массовое обновление — увеличить defaultReps на 2 для всех силовых
db.exercises.updateMany(
  { category: "strength" },
  { $inc: { defaultReps: 2 } }
);

// ════════════════════════════════════════════════════════════════════
// DELETE — Удаление документов
// ════════════════════════════════════════════════════════════════════

// 21. Удаление тестового пользователя
db.users.deleteOne({ login: "new_user_2024" });

// 22. Удаление тренировок пользователя старше определённой даты
db.workouts.deleteMany({
  userId: db.users.findOne({ login: "dmitry_vol" })._id,
  date: { $lt: new Date("2024-01-01") }
});

// 23. Удалить упражнение из тренировки ($pull из массива)
db.workouts.updateOne(
  { _id: workoutId },
  {
    $pull: {
      exercises: {
        exerciseId: db.exercises.findOne({ name: "Тяга верхнего блока" })._id
      }
    }
  }
);

// ════════════════════════════════════════════════════════════════════
// AGGREGATION — Статистика тренировок за период
// ════════════════════════════════════════════════════════════════════

// 24. Статистика тренировок за март 2024
db.workouts.aggregate([
  // Фильтр по пользователю и периоду
  {
    $match: {
      userId: db.users.findOne({ login: "ivan_petrov" })._id,
      date: { $gte: new Date("2024-03-01"), $lte: new Date("2024-03-31") }
    }
  },
  // Группировка — итоги
  {
    $group: {
      _id: "$userId",
      totalWorkouts: { $sum: 1 },
      totalMinutes: { $sum: "$durationMinutes" },
      totalCalories: { $sum: "$totalCaloriesBurned" },
      avgDuration: { $avg: "$durationMinutes" },
      avgHeartRate: { $avg: "$heartRateAvg" }
    }
  },
  // Форматирование вывода
  {
    $project: {
      _id: 0,
      totalWorkouts: 1,
      totalMinutes: 1,
      totalCalories: 1,
      avgDuration: { $round: ["$avgDuration", 1] },
      avgHeartRate: { $round: ["$avgHeartRate", 0] }
    }
  }
]);

// 25. Топ упражнений по количеству выполнений (для всех пользователей)
db.workouts.aggregate([
  { $unwind: "$exercises" },
  {
    $group: {
      _id: "$exercises.exerciseId",
      timesPerformed: { $sum: 1 },
      avgWeight: { $avg: "$exercises.weight" }
    }
  },
  {
    $lookup: {
      from: "exercises",
      localField: "_id",
      foreignField: "_id",
      as: "exerciseInfo"
    }
  },
  { $unwind: "$exerciseInfo" },
  {
    $project: {
      _id: 0,
      exerciseName: "$exerciseInfo.name",
      category: "$exerciseInfo.category",
      timesPerformed: 1,
      avgWeight: { $round: ["$avgWeight", 1] }
    }
  },
  { $sort: { timesPerformed: -1 } }
]);

print("✅ Все запросы выполнены успешно!");
