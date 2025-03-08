package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Tea struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	TeaName  string `json:"tea_name"`
	Provider string `json:"provider"`
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

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("ratings.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database")
	}
	db.AutoMigrate(&Tea{})
	db.AutoMigrate(&TeaRating{})
	db.AutoMigrate(&User{})
	initializeTeas()
	cleanupDuplicateUsers()

	r := mux.NewRouter()
	r.HandleFunc("/submit", handleSubmit).Methods("POST")
	r.HandleFunc("/teas", handleTeas).Methods("GET")
	r.HandleFunc("/register-user", handleRegisterUser).Methods("POST")
	r.HandleFunc("/ratings", handleRatings).Methods("GET")
	r.HandleFunc("/ratings/{id}", handleEdit).Methods("PUT")
	r.HandleFunc("/ratings/{id}", handleDelete).Methods("DELETE")
	r.HandleFunc("/summary", handleSummary).Methods("GET")
	r.HandleFunc("/dashboard", handleDashboard).Methods("GET")
	r.HandleFunc("/login", handleLogin).Methods("POST")
	r.HandleFunc("/logout", handleLogout).Methods("POST")
	r.HandleFunc("/user-ratings/{userId}", handleUserRatings).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	fmt.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func initializeTeas() {
	existingCount := int64(0)
	db.Model(&Tea{}).Count(&existingCount)
	if existingCount == 0 {
		teas := []Tea{
			{TeaName: "Dragonwell", Provider: "Clovis"},
			{TeaName: "Yun Wu", Provider: "Tanzeela"},
			{TeaName: "Laoshan", Provider: "Itsi"},
			{TeaName: "Kamairicha", Provider: "Tanzeela"},
			{TeaName: "Paksong Stardust", Provider: "Tanzeela"},
			{TeaName: "Spring Maofeng", Provider: "Tanzeela"},
		}
		db.Create(&teas)
		fmt.Println("Initialized database with sample teas.")
	}
}

// Handle new user registration
func handleRegisterUser(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	user.Name = strings.ToLower(strings.TrimSpace(user.Name))
	if err := db.Create(&user).Error; err != nil {
		http.Error(w, "User already exists", http.StatusConflict)
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
	var teas []Tea
	db.Find(&teas)
	json.NewEncoder(w).Encode(teas)
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
