package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Tea struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	TeaName  string `json:"tea_name"`
	Provider string `json:"provider"`
	Source   string `json:"source"`
}

type User struct {
	ID   uint
	Name string
}

type TeaRating struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	UserID      uint    `json:"user_id" gorm:"foreignKey"`
	TeaID       uint    `json:"tea_id" gorm:"foreignKey"`
	Umami       float64 `json:"umami"`
	Astringency float64 `json:"astringency"`
	Floral      float64 `json:"floral"`
	Vegetal     float64 `json:"vegetal"`
	Nutty       float64 `json:"nutty"`
	Roasted     float64 `json:"roasted"`
	Body        float64 `json:"body"`
	Rating      float64 `json:"rating"`
}

var db *gorm.DB

func init() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found or error loading it: %v", err)
	}
}

func main() {
	// Use LookupEnv to check if the variable exists
	dbURL, exists := os.LookupEnv("DATABASE_URL")

	if !exists {
		log.Fatal("DATABASE_URL is not set in Go")
	} else {
		fmt.Println("DATABASE_URL found:", dbURL)
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	var err error
	// Configure database connection
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt:                              false,
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	// Get underlying SQL DB to configure pool settings
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetMaxOpenConns(5)

	// Run migrations
	if err := db.AutoMigrate(&Tea{}, &TeaRating{}, &User{}); err != nil {
		log.Printf("Migration warning: %v", err)
	}

	r := mux.NewRouter()
	r.HandleFunc("/", handleRoot).Methods("GET")
	r.HandleFunc("/submit", handleSubmit).Methods("POST")
	r.HandleFunc("/teas", handleTeas).Methods("GET")
	r.HandleFunc("/register-tea", handleRegisterTea).Methods("POST")
	r.HandleFunc("/register-user", handleRegisterUser).Methods("POST")
	r.HandleFunc("/ratings", handleRatings).Methods("GET")
	r.HandleFunc("/ratings/{id}", handleEdit).Methods("PUT")
	r.HandleFunc("/ratings/{id}", handleDelete).Methods("DELETE")
	r.HandleFunc("/summary", handleSummary).Methods("GET")
	r.HandleFunc("/dashboard", handleDashboard).Methods("GET")
	r.HandleFunc("/login", handleLogin).Methods("POST")
	r.HandleFunc("/logout", handleLogout).Methods("POST")
	r.HandleFunc("/user-ratings/{userId}", handleUserRatings).Methods("GET")
	r.HandleFunc("/user/{userId}", handleGetUser).Methods("GET")
	r.HandleFunc("/drop-teas", handleDropTeas).Methods("POST")
	r.HandleFunc("/seed-teas", handleSeedTeas).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "I'm here"})
}

// Handle new user registration
func handleRegisterUser(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	user.Name = strings.ToLower(strings.TrimSpace(user.Name))

	// Check if username already exists
	var existingUser User
	if err := db.Where("name = ?", user.Name).First(&existingUser).Error; err == nil {
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}

	if err := db.Create(&user).Error; err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful", "token": fmt.Sprintf("user-%d", user.ID)})
}

// Handle user login
func handleLogin(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	username := strings.ToLower(strings.TrimSpace(request.Username))
	var user User
	if err := db.Where("name = ?", username).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful", "token": fmt.Sprintf("user-%d", user.ID)})
}

// Handle new rating submissions
func handleSubmit(w http.ResponseWriter, r *http.Request) {
	var rating TeaRating
	if err := json.NewDecoder(r.Body).Decode(&rating); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var existingTea Tea
	if err := db.Where("id = ?", rating.TeaID).First(&existingTea).Error; err != nil {
		http.Error(w, "Tea ID does not exist", http.StatusNotFound)
		return
	}
	var existingUser User
	if err := db.Where("id = ?", rating.UserID).First(&existingUser).Error; err != nil {
		http.Error(w, "User ID does not exist", http.StatusNotFound)
		return
	}

	db.Create(&rating)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(rating)
}

// Handle retrieve all ratings
func handleRatings(w http.ResponseWriter, r *http.Request) {
	var ratings []TeaRating
	db.Find(&ratings)
	json.NewEncoder(w).Encode(ratings)
}

// Handle retrieve teas
func handleTeas(w http.ResponseWriter, r *http.Request) {
	// Get user ID from query parameter
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	// Get all teas that haven't been rated by this user
	var teas []Tea
	db.Raw(`
		SELECT t.* 
		FROM teas t 
		WHERE t.id NOT IN (
			SELECT tea_id 
			FROM tea_ratings 
			WHERE user_id = ?
		)
	`, userID).Scan(&teas)

	// Create response with display format
	type TeaResponse struct {
		ID       uint   `json:"id"`
		TeaName  string `json:"tea_name"`
		Provider string `json:"provider"`
		Source   string `json:"source"`
		Display  string `json:"display"`
	}

	var response []TeaResponse
	for _, tea := range teas {
		displayStr := tea.TeaName
		if tea.Source != "" {
			displayStr = fmt.Sprintf("%s (%s)", tea.TeaName, tea.Source)
		}
		response = append(response, TeaResponse{
			ID:       tea.ID,
			TeaName:  tea.TeaName,
			Provider: tea.Provider,
			Source:   tea.Source,
			Display:  displayStr,
		})
	}
	json.NewEncoder(w).Encode(response)
}

// Handle editing existing ratings
func handleEdit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var rating TeaRating
	if err := db.First(&rating, id).Error; err != nil {
		http.Error(w, "Rating not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&rating); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	db.Save(&rating)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(rating)
}

// Handle deleting a rating
func handleDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := db.Delete(&TeaRating{}, id).Error; err != nil {
		http.Error(w, "Failed to delete rating", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Rating deleted"})
}

// Summarize ratings for each tea
type Summary struct {
	TeaName        string  `json:"tea_name"`
	AvgRating      float64 `json:"avg_rating"`
	AvgUmami       float64 `json:"avg_umami"`
	AvgAstringency float64 `json:"avg_astringency"`
	AvgFloral      float64 `json:"avg_floral"`
	AvgVegetal     float64 `json:"avg_vegetal"`
	AvgNutty       float64 `json:"avg_nutty"`
	AvgRoasted     float64 `json:"avg_roasted"`
}

func handleSummary(w http.ResponseWriter, r *http.Request) {
	var summaries []Summary
	db.Raw(`SELECT 
		t.tea_name, 
		AVG(tr.rating) as avg_rating, 
		AVG(tr.umami) as avg_umami, 
		AVG(tr.astringency) as avg_astringency,
		AVG(tr.floral) as avg_floral,
		AVG(tr.vegetal) as avg_vegetal,
		AVG(tr.nutty) as avg_nutty,
		AVG(tr.roasted) as avg_roasted
		FROM tea_ratings tr 
		JOIN teas t ON tr.tea_id = t.id 
		GROUP BY tr.tea_id`).
		Scan(&summaries)

	json.NewEncoder(w).Encode(summaries)
}

// Dashboard - Returns data stats
type Dashboard struct {
	TeaName     string  `json:"tea_name"`
	Umami       float64 `json:"umami"`
	Astringency float64 `json:"astringency"`
	Floral      float64 `json:"floral"`
	Vegetal     float64 `json:"vegetal"`
	Nutty       float64 `json:"nutty"`
	Roasted     float64 `json:"roasted"`
	Body        string  `json:"body"`
	Rating      float64 `json:"rating"`
}

func handleDashboard(w http.ResponseWriter, r *http.Request) {
	userToken := r.Header.Get("Authorization")
	if userToken == "" {
		http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
		return
	}

	userID := strings.TrimPrefix(userToken, "user-")
	var user User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		http.Error(w, "Unauthorized: Invalid user", http.StatusUnauthorized)
		return
	}

	if strings.ToLower(user.Name) != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}
	// TODO: Statistics
	return
}

// Handle retrieve user-specific ratings
func handleUserRatings(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	fmt.Println("User ID:", userId)

	var ratings []struct {
		TeaRating
		TeaName string `json:"tea_name"`
	}

	db.Table("tea_ratings").
		Select("tea_ratings.*, teas.tea_name").
		Joins("JOIN teas ON tea_ratings.tea_id = teas.id").
		Where("tea_ratings.user_id = ?", userId).
		Scan(&ratings)

	json.NewEncoder(w).Encode(ratings)
}

// Handle user logout
func handleLogout(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

// Clean up duplicate users
func cleanupDuplicateUsers() {
	// First, get all users with duplicate names
	var duplicateUsers []User
	db.Raw(`
		WITH DuplicateNames AS (
			SELECT Name, MIN(ID) as MinID
			FROM users
			GROUP BY Name
			HAVING COUNT(*) > 1
		)
		SELECT u.*
		FROM users u
		JOIN DuplicateNames d ON u.Name = d.Name
		WHERE u.ID > d.MinID
	`).Scan(&duplicateUsers)

	// Delete the duplicates (keeping the first instance)
	for _, user := range duplicateUsers {
		// Update ratings to point to the first instance of this user
		var firstUser User
		db.Where("name = ?", user.Name).Order("id asc").First(&firstUser)

		// Update any ratings from the duplicate user to point to the first instance
		db.Model(&TeaRating{}).Where("user_id = ?", user.ID).Update("user_id", firstUser.ID)

		// Delete the duplicate user
		db.Unscoped().Delete(&user)
	}
}

// Handle get user info
func handleGetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]

	var user User
	if err := db.First(&user, userId).Error; err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"name": user.Name})
}

// Handle registering a new tea
func handleRegisterTea(w http.ResponseWriter, r *http.Request) {
	var tea Tea
	if err := json.NewDecoder(r.Body).Decode(&tea); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tea.TeaName = strings.TrimSpace(tea.TeaName)
	tea.Provider = strings.TrimSpace(tea.Provider)

	if tea.TeaName == "" || tea.Provider == "" {
		http.Error(w, "Tea name and provider are required", http.StatusBadRequest)
		return
	}

	// Check if tea with same name and provider already exists
	var existingTea Tea
	if err := db.Where("tea_name = ? AND provider = ?", tea.TeaName, tea.Provider).First(&existingTea).Error; err == nil {
		http.Error(w, "Tea already exists", http.StatusConflict)
		return
	}

	if err := db.Create(&tea).Error; err != nil {
		http.Error(w, "Failed to create tea", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tea)
}

// Handle dropping all teas and their ratings
func handleDropTeas(w http.ResponseWriter, r *http.Request) {
	// Begin transaction
	tx := db.Begin()

	// Delete all tea ratings first (due to foreign key constraints)
	if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&TeaRating{}).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Failed to delete tea ratings", http.StatusInternalServerError)
		return
	}

	// Delete all teas
	if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&Tea{}).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Failed to delete teas", http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "All teas and ratings have been deleted"})
}

// Handle seeding sample teas
func handleSeedTeas(w http.ResponseWriter, r *http.Request) {
	teas := []Tea{
		{TeaName: "Dragonwell", Provider: "Clovis"},
		{TeaName: "Yun Wu", Provider: "Tanzeela"},
		{TeaName: "Laoshan", Provider: "Itsi"},
		{TeaName: "Kamairicha", Provider: "Tanzeela"},
		{TeaName: "Paksong Stardust", Provider: "Tanzeela"},
		{TeaName: "Spring Maofeng", Provider: "Tanzeela"},
	}

	// Begin transaction
	tx := db.Begin()

	// Create all teas
	if err := tx.Create(&teas).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Failed to seed teas", http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Sample teas have been seeded",
		"teas":    teas,
	})
}
