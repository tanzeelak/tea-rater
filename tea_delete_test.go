package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestUnlinkAndDeleteTea(t *testing.T) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL is required for database-backed handler tests")
	}
	connection, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	tx := connection.Begin()
	if tx.Error != nil {
		t.Fatal(tx.Error)
	}
	previousDB := db
	db = tx
	defer func() {
		db = previousDB
		tx.Rollback()
	}()

	source := fmt.Sprintf("deletion-test-%d", time.Now().UnixNano())
	tea := Tea{TeaName: "First", Provider: "Test", Source: source}
	otherTea := Tea{TeaName: "Second", Provider: "Test", Source: source}
	firstTasting := TeaTasting{Name: source + "-first"}
	secondTasting := TeaTasting{Name: source + "-second"}
	user := User{Name: source}
	for _, record := range []interface{}{&tea, &otherTea, &firstTasting, &secondTasting, &user} {
		if err := tx.Create(record).Error; err != nil {
			t.Fatal(err)
		}
	}
	for _, rating := range []TeaRating{
		{TeaID: tea.ID, TastingID: firstTasting.ID, UserID: user.ID},
		{TeaID: tea.ID, TastingID: firstTasting.ID, UserID: user.ID},
		{TeaID: tea.ID, TastingID: secondTasting.ID, UserID: user.ID},
		{TeaID: otherTea.ID, TastingID: firstTasting.ID, UserID: user.ID},
	} {
		if err := tx.Create(&rating).Error; err != nil {
			t.Fatal(err)
		}
	}

	router := mux.NewRouter()
	router.HandleFunc("/tastings/{tastingId}/teas/{teaId}", handleUnlinkTeaFromTasting).Methods(http.MethodDelete)
	router.HandleFunc("/teas/{id}", handleDeleteTea).Methods(http.MethodDelete)
	request := func(path string, status int, deleted int64) {
		t.Helper()
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest(http.MethodDelete, path, nil))
		if response.Code != status {
			t.Fatalf("DELETE %s: got %d, want %d: %s", path, response.Code, status, response.Body.String())
		}
		if status == http.StatusOK {
			var body struct {
				RatingsDeleted int64 `json:"ratings_deleted"`
			}
			if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
				t.Fatal(err)
			}
			if body.RatingsDeleted != deleted {
				t.Fatalf("DELETE %s: deleted %d ratings, want %d", path, body.RatingsDeleted, deleted)
			}
		}
	}
	countRatings := func(teaID, tastingID uint, want int64) {
		t.Helper()
		var count int64
		if err := tx.Model(&TeaRating{}).Where("tea_id = ? AND tasting_id = ?", teaID, tastingID).Count(&count).Error; err != nil {
			t.Fatal(err)
		}
		if count != want {
			t.Fatalf("tea %d, tasting %d: got %d ratings, want %d", teaID, tastingID, count, want)
		}
	}

	unlinkPath := fmt.Sprintf("/tastings/%d/teas/%d", firstTasting.ID, tea.ID)
	request(unlinkPath, http.StatusOK, 2)
	countRatings(tea.ID, firstTasting.ID, 0)
	countRatings(tea.ID, secondTasting.ID, 1)
	countRatings(otherTea.ID, firstTasting.ID, 1)
	request(unlinkPath, http.StatusNotFound, 0)
	request(fmt.Sprintf("/tastings/0/teas/%d", tea.ID), http.StatusBadRequest, 0)
	request(fmt.Sprintf("/tastings/%d/teas/not-a-number", firstTasting.ID), http.StatusBadRequest, 0)

	teaPath := fmt.Sprintf("/teas/%d", tea.ID)
	request(teaPath, http.StatusOK, 1)
	countRatings(tea.ID, secondTasting.ID, 0)
	countRatings(otherTea.ID, firstTasting.ID, 1)
	var count int64
	if err := tx.Model(&Tea{}).Where("id = ?", tea.ID).Count(&count).Error; err != nil || count != 0 {
		t.Fatalf("deleted tea still exists: count=%d err=%v", count, err)
	}
	if err := tx.Model(&TeaTasting{}).Where("id = ?", firstTasting.ID).Count(&count).Error; err != nil || count != 1 {
		t.Fatalf("tasting was changed: count=%d err=%v", count, err)
	}
	request(teaPath, http.StatusNotFound, 0)
	request("/teas/0", http.StatusBadRequest, 0)
}
