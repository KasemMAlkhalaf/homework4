// cmd/api/main.go — Фитнес-трекер API на Go + MongoDB
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ─── Модели ──────────────────────────────────────────────────────────────────

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"   json:"id,omitempty"`
	Login        string             `bson:"login"           json:"login"`
	FirstName    string             `bson:"firstName"       json:"firstName"`
	LastName     string             `bson:"lastName"        json:"lastName"`
	Email        string             `bson:"email"           json:"email"`
	PasswordHash string             `bson:"passwordHash"    json:"-"`
	Age          int                `bson:"age,omitempty"   json:"age,omitempty"`
	Weight       float64            `bson:"weight,omitempty" json:"weight,omitempty"`
	Height       float64            `bson:"height,omitempty" json:"height,omitempty"`
	Goal         string             `bson:"goal"            json:"goal"`
	CreatedAt    time.Time          `bson:"createdAt"       json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt"       json:"updatedAt"`
}

type Exercise struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"        json:"id,omitempty"`
	Name         string             `bson:"name"                 json:"name"`
	Category     string             `bson:"category"             json:"category"`
	MuscleGroups []string           `bson:"muscleGroups"         json:"muscleGroups"`
	Description  string             `bson:"description,omitempty" json:"description,omitempty"`
	Unit         string             `bson:"unit"                 json:"unit"`
	DefaultSets  int                `bson:"defaultSets"          json:"defaultSets"`
	DefaultReps  int                `bson:"defaultReps"          json:"defaultReps"`
	CreatedAt    time.Time          `bson:"createdAt"            json:"createdAt"`
}

type ExerciseSet struct {
	ExerciseID primitive.ObjectID `bson:"exerciseId" json:"exerciseId"`
	Sets       int                `bson:"sets"       json:"sets"`
	Reps       int                `bson:"reps,omitempty" json:"reps,omitempty"`
	Weight     float64            `bson:"weight,omitempty" json:"weight,omitempty"`
	Duration   int                `bson:"duration,omitempty" json:"duration,omitempty"`
	Distance   float64            `bson:"distance,omitempty" json:"distance,omitempty"`
	Completed  bool               `bson:"completed"  json:"completed"`
}

type Workout struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty"        json:"id,omitempty"`
	UserID              primitive.ObjectID `bson:"userId"               json:"userId"`
	Title               string             `bson:"title"                json:"title"`
	Date                time.Time          `bson:"date"                 json:"date"`
	DurationMinutes     int                `bson:"durationMinutes"      json:"durationMinutes"`
	Notes               string             `bson:"notes,omitempty"      json:"notes,omitempty"`
	Exercises           []ExerciseSet      `bson:"exercises"            json:"exercises"`
	TotalCaloriesBurned int                `bson:"totalCaloriesBurned"  json:"totalCaloriesBurned"`
	HeartRateAvg        int                `bson:"heartRateAvg,omitempty" json:"heartRateAvg,omitempty"`
	CreatedAt           time.Time          `bson:"createdAt"            json:"createdAt"`
}

type WorkoutStats struct {
	TotalWorkouts int     `bson:"totalWorkouts" json:"totalWorkouts"`
	TotalMinutes  int     `bson:"totalMinutes"  json:"totalMinutes"`
	TotalCalories int     `bson:"totalCalories" json:"totalCalories"`
	AvgDuration   float64 `bson:"avgDuration"   json:"avgDuration"`
	AvgHeartRate  float64 `bson:"avgHeartRate"  json:"avgHeartRate"`
}

// ─── App ─────────────────────────────────────────────────────────────────────

type App struct {
	db *mongo.Database
}

func newApp(mongoURI string) (*App, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return nil, err
	}
	if err = client.Ping(ctx, nil); err != nil {
		return nil, err
	}
	log.Println("✅ Connected to MongoDB")
	return &App{db: client.Database("fitness_tracker")}, nil
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func respond(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func respondErr(w http.ResponseWriter, status int, msg string) {
	respond(w, status, map[string]string{"error": msg})
}

func parseBody(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}

// ─── Handlers: Users ─────────────────────────────────────────────────────────

// POST /users — Создание нового пользователя
func (a *App) createUser(w http.ResponseWriter, r *http.Request) {
	var u User
	if err := parseBody(r, &u); err != nil {
		respondErr(w, 400, "invalid body: "+err.Error())
		return
	}
	u.ID = primitive.NewObjectID()
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	if u.PasswordHash == "" {
		u.PasswordHash = "$2b$10$placeholder"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := a.db.Collection("users").InsertOne(ctx, u)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			respondErr(w, 409, "login already exists")
			return
		}
		respondErr(w, 500, err.Error())
		return
	}
	u.PasswordHash = ""
	respond(w, 201, u)
}

// GET /users?login=xxx — Поиск по логину
// GET /users?firstName=xxx&lastName=yyy — Поиск по маске имени/фамилии
func (a *App) getUsers(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	q := r.URL.Query()
	filter := bson.M{}

	if login := q.Get("login"); login != "" {
		filter["login"] = login
		var u User
		err := a.db.Collection("users").FindOne(ctx, filter).Decode(&u)
		if err == mongo.ErrNoDocuments {
			respondErr(w, 404, "user not found")
			return
		} else if err != nil {
			respondErr(w, 500, err.Error())
			return
		}
		u.PasswordHash = ""
		respond(w, 200, u)
		return
	}

	// Поиск по маске имя/фамилия
	if fn := q.Get("firstName"); fn != "" {
		filter["firstName"] = bson.M{"$regex": fn, "$options": "i"}
	}
	if ln := q.Get("lastName"); ln != "" {
		filter["lastName"] = bson.M{"$regex": ln, "$options": "i"}
	}

	cur, err := a.db.Collection("users").Find(ctx, filter)
	if err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	defer cur.Close(ctx)

	var users []User
	if err = cur.All(ctx, &users); err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	for i := range users {
		users[i].PasswordHash = ""
	}
	respond(w, 200, users)
}

// ─── Handlers: Exercises ─────────────────────────────────────────────────────

// POST /exercises — Создание упражнения
func (a *App) createExercise(w http.ResponseWriter, r *http.Request) {
	var e Exercise
	if err := parseBody(r, &e); err != nil {
		respondErr(w, 400, "invalid body: "+err.Error())
		return
	}
	e.ID = primitive.NewObjectID()
	e.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := a.db.Collection("exercises").InsertOne(ctx, e)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			respondErr(w, 409, "exercise already exists")
			return
		}
		respondErr(w, 500, err.Error())
		return
	}
	respond(w, 201, e)
}

// GET /exercises — Получение списка упражнений (с фильтром по category)
func (a *App) listExercises(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if cat := r.URL.Query().Get("category"); cat != "" {
		filter["category"] = cat
	}

	cur, err := a.db.Collection("exercises").Find(ctx, filter,
		options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	defer cur.Close(ctx)

	var exercises []Exercise
	if err = cur.All(ctx, &exercises); err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	respond(w, 200, exercises)
}

// ─── Handlers: Workouts ──────────────────────────────────────────────────────

// POST /workouts — Создание тренировки
func (a *App) createWorkout(w http.ResponseWriter, r *http.Request) {
	var wk Workout
	if err := parseBody(r, &wk); err != nil {
		respondErr(w, 400, "invalid body: "+err.Error())
		return
	}
	wk.ID = primitive.NewObjectID()
	wk.CreatedAt = time.Now()
	if wk.Date.IsZero() {
		wk.Date = time.Now()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := a.db.Collection("workouts").InsertOne(ctx, wk)
	if err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	respond(w, 201, wk)
}

// POST /workouts/{id}/exercises — Добавление упражнения в тренировку
func (a *App) addExerciseToWorkout(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	wkID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		respondErr(w, 400, "invalid workout id")
		return
	}

	var es ExerciseSet
	if err := parseBody(r, &es); err != nil {
		respondErr(w, 400, "invalid body: "+err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := a.db.Collection("workouts").UpdateOne(ctx,
		bson.M{"_id": wkID},
		bson.M{"$push": bson.M{"exercises": es}},
	)
	if err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	if res.MatchedCount == 0 {
		respondErr(w, 404, "workout not found")
		return
	}
	respond(w, 200, map[string]string{"status": "exercise added"})
}

// GET /users/{id}/workouts — История тренировок пользователя
func (a *App) getUserWorkouts(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		respondErr(w, 400, "invalid user id")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cur, err := a.db.Collection("workouts").Find(ctx,
		bson.M{"userId": userID},
		options.Find().SetSort(bson.D{{Key: "date", Value: -1}}),
	)
	if err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	defer cur.Close(ctx)

	var workouts []Workout
	if err = cur.All(ctx, &workouts); err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	respond(w, 200, workouts)
}

// GET /users/{id}/stats?from=2024-03-01&to=2024-03-31 — Статистика за период
func (a *App) getUserStats(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		respondErr(w, 400, "invalid user id")
		return
	}

	q := r.URL.Query()
	matchFilter := bson.M{"userId": userID}

	if from := q.Get("from"); from != "" {
		t, err := time.Parse("2006-01-02", from)
		if err == nil {
			if matchFilter["date"] == nil {
				matchFilter["date"] = bson.M{}
			}
			matchFilter["date"].(bson.M)["$gte"] = t
		}
	}
	if to := q.Get("to"); to != "" {
		t, err := time.Parse("2006-01-02", to)
		if err == nil {
			if matchFilter["date"] == nil {
				matchFilter["date"] = bson.M{}
			}
			matchFilter["date"].(bson.M)["$lte"] = t.Add(24 * time.Hour)
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: matchFilter}},
		{{Key: "$group", Value: bson.M{
			"_id":           nil,
			"totalWorkouts": bson.M{"$sum": 1},
			"totalMinutes":  bson.M{"$sum": "$durationMinutes"},
			"totalCalories": bson.M{"$sum": "$totalCaloriesBurned"},
			"avgDuration":   bson.M{"$avg": "$durationMinutes"},
			"avgHeartRate":  bson.M{"$avg": "$heartRateAvg"},
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":           0,
			"totalWorkouts": 1,
			"totalMinutes":  1,
			"totalCalories": 1,
			"avgDuration":   1,
			"avgHeartRate":  1,
		}}},
	}

	cur, err := a.db.Collection("workouts").Aggregate(ctx, pipeline)
	if err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	defer cur.Close(ctx)

	var results []WorkoutStats
	if err = cur.All(ctx, &results); err != nil {
		respondErr(w, 500, err.Error())
		return
	}
	if len(results) == 0 {
		respond(w, 200, WorkoutStats{})
		return
	}
	respond(w, 200, results[0])
}

// ─── Main ─────────────────────────────────────────────────────────────────────

func main() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017/fitness_tracker"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	app, err := newApp(mongoURI)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}

	mux := http.NewServeMux()

	// Users
	mux.HandleFunc("POST /users", app.createUser)
	mux.HandleFunc("GET /users", app.getUsers)
	mux.HandleFunc("GET /users/{id}/workouts", app.getUserWorkouts)
	mux.HandleFunc("GET /users/{id}/stats", app.getUserStats)

	// Exercises
	mux.HandleFunc("POST /exercises", app.createExercise)
	mux.HandleFunc("GET /exercises", app.listExercises)

	// Workouts
	mux.HandleFunc("POST /workouts", app.createWorkout)
	mux.HandleFunc("POST /workouts/{id}/exercises", app.addExerciseToWorkout)

	log.Printf("🚀 Fitness API running on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
