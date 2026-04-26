// data.js — Тестовые данные для Fitness Tracker
// Запуск: mongosh fitness_tracker data.js

// ── Очистка ──────────────────────────────────────────────────────────────────
db.users.drop();
db.exercises.drop();
db.workouts.drop();

// ── Users (10 документов) ────────────────────────────────────────────────────
const usersResult = db.users.insertMany([
  {
    login: "john_doe",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    age: 28,
    weight_kg: 82.5,
    height_cm: 180,
    created_at: new Date("2024-01-15"),
  },
  {
    login: "jane_smith",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    age: 25,
    weight_kg: 62.0,
    height_cm: 165,
    created_at: new Date("2024-02-01"),
  },
  {
    login: "alex_johnson",
    first_name: "Alex",
    last_name: "Johnson",
    email: "alex.j@example.com",
    age: 35,
    weight_kg: 90.0,
    height_cm: 178,
    created_at: new Date("2024-02-10"),
  },
  {
    login: "maria_garcia",
    first_name: "Maria",
    last_name: "Garcia",
    email: "maria.garcia@example.com",
    age: 30,
    weight_kg: 58.5,
    height_cm: 160,
    created_at: new Date("2024-02-20"),
  },
  {
    login: "mike_brown",
    first_name: "Mike",
    last_name: "Brown",
    email: "mike.brown@example.com",
    age: 40,
    weight_kg: 95.0,
    height_cm: 182,
    created_at: new Date("2024-03-01"),
  },
  {
    login: "sara_wilson",
    first_name: "Sara",
    last_name: "Wilson",
    email: "sara.wilson@example.com",
    age: 22,
    weight_kg: 55.0,
    height_cm: 162,
    created_at: new Date("2024-03-05"),
  },
  {
    login: "david_lee",
    first_name: "David",
    last_name: "Lee",
    email: "david.lee@example.com",
    age: 33,
    weight_kg: 75.0,
    height_cm: 175,
    created_at: new Date("2024-03-10"),
  },
  {
    login: "emily_clark",
    first_name: "Emily",
    last_name: "Clark",
    email: "emily.clark@example.com",
    age: 27,
    weight_kg: 60.0,
    height_cm: 168,
    created_at: new Date("2024-03-15"),
  },
  {
    login: "chris_martin",
    first_name: "Chris",
    last_name: "Martin",
    email: "chris.martin@example.com",
    age: 31,
    weight_kg: 78.0,
    height_cm: 176,
    created_at: new Date("2024-03-20"),
  },
  {
    login: "anna_taylor",
    first_name: "Anna",
    last_name: "Taylor",
    email: "anna.taylor@example.com",
    age: 29,
    weight_kg: 65.0,
    height_cm: 170,
    created_at: new Date("2024-03-25"),
  },
]);

const users = db.users.find().toArray();
print(`Inserted ${users.length} users`);

// ── Exercises (12 документов) ─────────────────────────────────────────────────
const exercisesResult = db.exercises.insertMany([
  {
    name: "Barbell Squat",
    category: "strength",
    muscle_groups: ["quadriceps", "hamstrings", "glutes", "core"],
    description: "Classic compound lower body exercise with a barbell on the back.",
    equipment: "barbell",
    difficulty: "intermediate",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Push-Up",
    category: "strength",
    muscle_groups: ["chest", "triceps", "shoulders", "core"],
    description: "Bodyweight exercise targeting the upper body.",
    equipment: "none",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Running",
    category: "cardio",
    muscle_groups: ["legs", "core"],
    description: "Continuous aerobic activity on treadmill or outdoors.",
    equipment: "none",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Deadlift",
    category: "strength",
    muscle_groups: ["hamstrings", "glutes", "back", "core"],
    description: "Compound hip-hinge movement lifting a barbell from the floor.",
    equipment: "barbell",
    difficulty: "advanced",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Pull-Up",
    category: "strength",
    muscle_groups: ["back", "biceps", "core"],
    description: "Bodyweight vertical pulling exercise.",
    equipment: "pull-up bar",
    difficulty: "intermediate",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Plank",
    category: "strength",
    muscle_groups: ["core", "shoulders"],
    description: "Isometric core strengthening exercise.",
    equipment: "none",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Cycling",
    category: "cardio",
    muscle_groups: ["legs", "glutes"],
    description: "Aerobic exercise on a stationary or outdoor bike.",
    equipment: "bike",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Bench Press",
    category: "strength",
    muscle_groups: ["chest", "triceps", "shoulders"],
    description: "Compound upper body pressing exercise on a flat bench.",
    equipment: "barbell",
    difficulty: "intermediate",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Yoga Flow",
    category: "flexibility",
    muscle_groups: ["full body"],
    description: "Dynamic sequence of yoga poses for flexibility and mindfulness.",
    equipment: "yoga mat",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Lunges",
    category: "strength",
    muscle_groups: ["quadriceps", "hamstrings", "glutes"],
    description: "Unilateral lower body exercise stepping forward or backward.",
    equipment: "none",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Rowing",
    category: "cardio",
    muscle_groups: ["back", "arms", "legs", "core"],
    description: "Full-body cardio on a rowing machine.",
    equipment: "rowing machine",
    difficulty: "intermediate",
    created_at: new Date("2024-01-01"),
  },
  {
    name: "Single-Leg Balance",
    category: "balance",
    muscle_groups: ["legs", "core"],
    description: "Standing on one leg to improve proprioception and stability.",
    equipment: "none",
    difficulty: "beginner",
    created_at: new Date("2024-01-01"),
  },
]);

const exercises = db.exercises.find().toArray();
print(`Inserted ${exercises.length} exercises`);

// Helpers — получаем ObjectId по имени
function exId(name) {
  return db.exercises.findOne({ name })._id;
}
function userId(login) {
  return db.users.findOne({ login })._id;
}

// ── Workouts (12 документов) ──────────────────────────────────────────────────
db.workouts.insertMany([
  {
    user_id: userId("john_doe"),
    title: "Leg Day",
    date: new Date("2024-04-01"),
    duration_minutes: 60,
    notes: "Felt strong today",
    exercises: [
      { exercise_id: exId("Barbell Squat"), exercise_name: "Barbell Squat", sets: 4, reps: 8, weight_kg: 100, duration_seconds: null, order: 1 },
      { exercise_id: exId("Lunges"),        exercise_name: "Lunges",        sets: 3, reps: 12, weight_kg: 20,  duration_seconds: null, order: 2 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("john_doe"),
    title: "Push Day",
    date: new Date("2024-04-03"),
    duration_minutes: 50,
    notes: "Increased bench weight",
    exercises: [
      { exercise_id: exId("Bench Press"), exercise_name: "Bench Press", sets: 4, reps: 6,  weight_kg: 90, duration_seconds: null, order: 1 },
      { exercise_id: exId("Push-Up"),     exercise_name: "Push-Up",     sets: 3, reps: 20, weight_kg: 0,  duration_seconds: null, order: 2 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("john_doe"),
    title: "Cardio Session",
    date: new Date("2024-04-05"),
    duration_minutes: 35,
    notes: "Morning run",
    exercises: [
      { exercise_id: exId("Running"), exercise_name: "Running", sets: 1, reps: null, weight_kg: null, duration_seconds: 2100, order: 1 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("jane_smith"),
    title: "Full Body Strength",
    date: new Date("2024-04-02"),
    duration_minutes: 55,
    notes: "Great session",
    exercises: [
      { exercise_id: exId("Deadlift"),  exercise_name: "Deadlift",  sets: 3, reps: 5,  weight_kg: 70, duration_seconds: null, order: 1 },
      { exercise_id: exId("Pull-Up"),   exercise_name: "Pull-Up",   sets: 3, reps: 8,  weight_kg: 0,  duration_seconds: null, order: 2 },
      { exercise_id: exId("Plank"),     exercise_name: "Plank",     sets: 3, reps: null, weight_kg: null, duration_seconds: 60, order: 3 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("jane_smith"),
    title: "Yoga & Flexibility",
    date: new Date("2024-04-06"),
    duration_minutes: 45,
    notes: "Recovery day",
    exercises: [
      { exercise_id: exId("Yoga Flow"), exercise_name: "Yoga Flow", sets: 1, reps: null, weight_kg: null, duration_seconds: 2700, order: 1 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("alex_johnson"),
    title: "Heavy Lifting",
    date: new Date("2024-04-01"),
    duration_minutes: 75,
    notes: "PR on deadlift",
    exercises: [
      { exercise_id: exId("Deadlift"),      exercise_name: "Deadlift",      sets: 5, reps: 3, weight_kg: 140, duration_seconds: null, order: 1 },
      { exercise_id: exId("Barbell Squat"), exercise_name: "Barbell Squat", sets: 4, reps: 5, weight_kg: 120, duration_seconds: null, order: 2 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("alex_johnson"),
    title: "Cardio & Core",
    date: new Date("2024-04-04"),
    duration_minutes: 40,
    notes: "",
    exercises: [
      { exercise_id: exId("Rowing"),  exercise_name: "Rowing",  sets: 1, reps: null, weight_kg: null, duration_seconds: 1200, order: 1 },
      { exercise_id: exId("Plank"),   exercise_name: "Plank",   sets: 4, reps: null, weight_kg: null, duration_seconds: 90,   order: 2 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("maria_garcia"),
    title: "Morning Cardio",
    date: new Date("2024-04-02"),
    duration_minutes: 30,
    notes: "Easy pace",
    exercises: [
      { exercise_id: exId("Cycling"), exercise_name: "Cycling", sets: 1, reps: null, weight_kg: null, duration_seconds: 1800, order: 1 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("maria_garcia"),
    title: "Balance & Core",
    date: new Date("2024-04-07"),
    duration_minutes: 25,
    notes: "",
    exercises: [
      { exercise_id: exId("Single-Leg Balance"), exercise_name: "Single-Leg Balance", sets: 3, reps: null, weight_kg: null, duration_seconds: 60, order: 1 },
      { exercise_id: exId("Plank"),              exercise_name: "Plank",              sets: 3, reps: null, weight_kg: null, duration_seconds: 45, order: 2 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("mike_brown"),
    title: "Upper Body Power",
    date: new Date("2024-04-01"),
    duration_minutes: 65,
    notes: "Focus on form",
    exercises: [
      { exercise_id: exId("Bench Press"), exercise_name: "Bench Press", sets: 5, reps: 5,  weight_kg: 110, duration_seconds: null, order: 1 },
      { exercise_id: exId("Pull-Up"),     exercise_name: "Pull-Up",     sets: 4, reps: 10, weight_kg: 10,  duration_seconds: null, order: 2 },
      { exercise_id: exId("Push-Up"),     exercise_name: "Push-Up",     sets: 3, reps: 25, weight_kg: 0,   duration_seconds: null, order: 3 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("sara_wilson"),
    title: "Beginner Strength",
    date: new Date("2024-04-03"),
    duration_minutes: 40,
    notes: "First strength session",
    exercises: [
      { exercise_id: exId("Push-Up"), exercise_name: "Push-Up", sets: 3, reps: 10, weight_kg: 0, duration_seconds: null, order: 1 },
      { exercise_id: exId("Lunges"),  exercise_name: "Lunges",  sets: 3, reps: 10, weight_kg: 0, duration_seconds: null, order: 2 },
      { exercise_id: exId("Plank"),   exercise_name: "Plank",   sets: 3, reps: null, weight_kg: null, duration_seconds: 30, order: 3 },
    ],
    created_at: new Date(),
  },
  {
    user_id: userId("david_lee"),
    title: "Rowing + Core",
    date: new Date("2024-04-05"),
    duration_minutes: 50,
    notes: "Tough session",
    exercises: [
      { exercise_id: exId("Rowing"), exercise_name: "Rowing", sets: 3, reps: null, weight_kg: null, duration_seconds: 600, order: 1 },
      { exercise_id: exId("Plank"),  exercise_name: "Plank",  sets: 4, reps: null, weight_kg: null, duration_seconds: 60,  order: 2 },
    ],
    created_at: new Date(),
  },
]);

print(`Inserted ${db.workouts.countDocuments()} workouts`);

// ── Индексы ───────────────────────────────────────────────────────────────────
db.users.createIndex({ login: 1 }, { unique: true });
db.users.createIndex({ first_name: 1, last_name: 1 });
db.exercises.createIndex({ name: 1 }, { unique: true });
db.exercises.createIndex({ category: 1 });
db.workouts.createIndex({ user_id: 1 });
db.workouts.createIndex({ user_id: 1, date: -1 });
db.workouts.createIndex({ date: 1 });

print("Indexes created. Data load complete.");
