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

	r := mux.NewRouter()
	r.HandleFunc("/submit", handleSubmit).Methods("POST")        // good
	r.HandleFunc("/register", handleRegister).Methods("POST")    // good
	r.HandleFunc("/rating", handleRating).Methods("GET")         // good
	r.HandleFunc("/rating/{id}", handleEdit).Methods("PUT")      // good
	r.HandleFunc("/rating/{id}", handleDelete).Methods("DELETE") // good
	r.HandleFunc("/summary", handleSummary).Methods("GET")
	r.HandleFunc("/admin", handleAdminView).Methods("GET")
	r.HandleFunc("/login", handleLogin).Methods("POST") // good

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
func handleRegister(w http.ResponseWriter, r *http.Request) {
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
	json.NewEncoder(w).Encode(user)
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
	db.Create(&rating)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(rating)
}

// Handle retrieve all ratings
func handleRating(w http.ResponseWriter, r *http.Request) {
	var ratings []TeaRating
	db.Find(&ratings)
	json.NewEncoder(w).Encode(ratings)
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
}

func handleSummary(w http.ResponseWriter, r *http.Request) {
	var summaries []Summary
	db.Raw("SELECT tea_name, AVG(rating) as avg_rating, AVG(umami) as avg_umami, AVG(astringency) as avg_astringency FROM tea_ratings GROUP BY tea_name").Scan(&summaries)
	json.NewEncoder(w).Encode(summaries)
}

// Admin Dashboard - Returns all data
type AdminView struct {
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

func handleAdminView(w http.ResponseWriter, r *http.Request) {
	var adminData []AdminView
	db.Raw("SELECT tea_name, umami, astringency, floral, vegetal, nutty, roasted, body, rating FROM tea_ratings").Scan(&adminData)
	json.NewEncoder(w).Encode(adminData)
}
