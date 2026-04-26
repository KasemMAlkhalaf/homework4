"""
Fitness Tracker API — FastAPI + Motor (async MongoDB driver)
"""
from contextlib import asynccontextmanager
from datetime import datetime, date
from typing import Optional, List

from bson import ObjectId
from fastapi import FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
import os

# ── MongoDB connection ────────────────────────────────────────────────────────
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "fitness_tracker"

client: AsyncIOMotorClient = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = AsyncIOMotorClient(MONGO_URL)
    app.state.db = client[DB_NAME]
    yield
    client.close()


app = FastAPI(title="Fitness Tracker API", version="1.0.0", lifespan=lifespan)


def get_db():
    return app.state.db


def doc_to_dict(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serialisable dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        elif isinstance(v, list):
            doc[k] = [
                {**item, "exercise_id": str(item["exercise_id"])}
                if isinstance(item, dict) and "exercise_id" in item
                else item
                for item in v
            ]
    return doc


# ── Pydantic models ───────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    login: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-z0-9_]+$")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=10, le=120)
    weight_kg: Optional[float] = Field(None, ge=20, le=500)
    height_cm: Optional[int] = Field(None, ge=50, le=300)


class ExerciseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., pattern=r"^(cardio|strength|flexibility|balance)$")
    muscle_groups: List[str] = Field(..., min_length=1)
    description: Optional[str] = Field(None, max_length=500)
    equipment: Optional[str] = Field(None, max_length=100)
    difficulty: str = Field(..., pattern=r"^(beginner|intermediate|advanced)$")


class WorkoutExercise(BaseModel):
    exercise_id: str
    sets: int = Field(..., ge=1)
    reps: Optional[int] = Field(None, ge=1)
    weight_kg: Optional[float] = Field(None, ge=0)
    duration_seconds: Optional[int] = Field(None, ge=1)
    order: int = Field(..., ge=1)


class WorkoutCreate(BaseModel):
    user_id: str
    title: str = Field(..., min_length=1, max_length=200)
    date: datetime
    duration_minutes: int = Field(..., ge=1, le=600)
    notes: Optional[str] = Field(None, max_length=1000)
    exercises: List[WorkoutExercise] = []


# ── Users endpoints ───────────────────────────────────────────────────────────

@app.post("/users", status_code=201, tags=["Users"])
async def create_user(user: UserCreate):
    """Создание нового пользователя."""
    db = get_db()
    if await db.users.find_one({"login": user.login}):
        raise HTTPException(status_code=409, detail="Login already exists")
    doc = {**user.model_dump(), "created_at": datetime.utcnow()}
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)


@app.get("/users/by-login/{login}", tags=["Users"])
async def get_user_by_login(login: str):
    """Поиск пользователя по логину."""
    db = get_db()
    user = await db.users.find_one({"login": login})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return doc_to_dict(user)


@app.get("/users/search", tags=["Users"])
async def search_users(
    first_name: Optional[str] = Query(None, description="Маска имени"),
    last_name: Optional[str] = Query(None, description="Маска фамилии"),
):
    """Поиск пользователей по маске имя и/или фамилии."""
    db = get_db()
    query = {}
    if first_name:
        query["first_name"] = {"$regex": first_name, "$options": "i"}
    if last_name:
        query["last_name"] = {"$regex": last_name, "$options": "i"}
    if not query:
        raise HTTPException(status_code=400, detail="Provide at least one search parameter")
    users = await db.users.find(query).to_list(100)
    return [doc_to_dict(u) for u in users]


# ── Exercises endpoints ───────────────────────────────────────────────────────

@app.post("/exercises", status_code=201, tags=["Exercises"])
async def create_exercise(exercise: ExerciseCreate):
    """Создание упражнения."""
    db = get_db()
    if await db.exercises.find_one({"name": exercise.name}):
        raise HTTPException(status_code=409, detail="Exercise already exists")
    doc = {**exercise.model_dump(), "created_at": datetime.utcnow()}
    result = await db.exercises.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)


@app.get("/exercises", tags=["Exercises"])
async def list_exercises(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
):
    """Получение списка упражнений с опциональной фильтрацией."""
    db = get_db()
    query = {}
    if category:
        query["category"] = category
    if difficulty:
        query["difficulty"] = difficulty
    exercises = await db.exercises.find(query).sort("name", 1).to_list(200)
    return [doc_to_dict(e) for e in exercises]


# ── Workouts endpoints ────────────────────────────────────────────────────────

@app.post("/workouts", status_code=201, tags=["Workouts"])
async def create_workout(workout: WorkoutCreate):
    """Создание тренировки."""
    db = get_db()
    if not ObjectId.is_valid(workout.user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id")
    user = await db.users.find_one({"_id": ObjectId(workout.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    exercises_embedded = []
    for ex in workout.exercises:
        if not ObjectId.is_valid(ex.exercise_id):
            raise HTTPException(status_code=400, detail=f"Invalid exercise_id: {ex.exercise_id}")
        exercise = await db.exercises.find_one({"_id": ObjectId(ex.exercise_id)})
        if not exercise:
            raise HTTPException(status_code=404, detail=f"Exercise {ex.exercise_id} not found")
        exercises_embedded.append({
            "exercise_id": ObjectId(ex.exercise_id),
            "exercise_name": exercise["name"],
            "sets": ex.sets,
            "reps": ex.reps,
            "weight_kg": ex.weight_kg,
            "duration_seconds": ex.duration_seconds,
            "order": ex.order,
        })

    doc = {
        "user_id": ObjectId(workout.user_id),
        "title": workout.title,
        "date": workout.date,
        "duration_minutes": workout.duration_minutes,
        "notes": workout.notes,
        "exercises": exercises_embedded,
        "created_at": datetime.utcnow(),
    }
    result = await db.workouts.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)


@app.post("/workouts/{workout_id}/exercises", tags=["Workouts"])
async def add_exercise_to_workout(workout_id: str, exercise: WorkoutExercise):
    """Добавление упражнения в тренировку."""
    db = get_db()
    if not ObjectId.is_valid(workout_id):
        raise HTTPException(status_code=400, detail="Invalid workout_id")
    if not ObjectId.is_valid(exercise.exercise_id):
        raise HTTPException(status_code=400, detail="Invalid exercise_id")

    ex_doc = await db.exercises.find_one({"_id": ObjectId(exercise.exercise_id)})
    if not ex_doc:
        raise HTTPException(status_code=404, detail="Exercise not found")

    embedded = {
        "exercise_id": ObjectId(exercise.exercise_id),
        "exercise_name": ex_doc["name"],
        "sets": exercise.sets,
        "reps": exercise.reps,
        "weight_kg": exercise.weight_kg,
        "duration_seconds": exercise.duration_seconds,
        "order": exercise.order,
    }
    result = await db.workouts.update_one(
        {"_id": ObjectId(workout_id)},
        {"$push": {"exercises": embedded}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"message": "Exercise added successfully"}


@app.get("/users/{user_id}/workouts", tags=["Workouts"])
async def get_workout_history(user_id: str):
    """Получение истории тренировок пользователя."""
    db = get_db()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id")
    workouts = await db.workouts.find(
        {"user_id": ObjectId(user_id)}
    ).sort("date", -1).to_list(500)
    return [doc_to_dict(w) for w in workouts]


@app.get("/users/{user_id}/workouts/stats", tags=["Workouts"])
async def get_workout_stats(
    user_id: str,
    from_date: datetime = Query(..., description="Начало периода, ISO 8601"),
    to_date: datetime = Query(..., description="Конец периода, ISO 8601"),
):
    """Получение статистики тренировок пользователя за период."""
    db = get_db()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id")

    pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "date": {"$gte": from_date, "$lte": to_date},
        }},
        {"$unwind": "$exercises"},
        {"$group": {
            "_id": "$user_id",
            "total_workouts": {"$sum": 1},
            "total_duration_minutes": {"$sum": "$duration_minutes"},
            "avg_duration_minutes": {"$avg": "$duration_minutes"},
            "total_sets": {"$sum": "$exercises.sets"},
            "unique_exercises": {"$addToSet": "$exercises.exercise_name"},
        }},
        {"$project": {
            "_id": 0,
            "total_workouts": 1,
            "total_duration_minutes": 1,
            "avg_duration_minutes": {"$round": ["$avg_duration_minutes", 1]},
            "total_sets": 1,
            "unique_exercise_count": {"$size": "$unique_exercises"},
            "unique_exercises": 1,
        }},
    ]

    result = await db.workouts.aggregate(pipeline).to_list(1)
    if not result:
        return {
            "total_workouts": 0,
            "total_duration_minutes": 0,
            "avg_duration_minutes": 0,
            "total_sets": 0,
            "unique_exercise_count": 0,
            "unique_exercises": [],
        }
    return result[0]


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
