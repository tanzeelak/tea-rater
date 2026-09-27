package main

import (
"bytes"
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

func TestUnratedTastingMembership(t *testing.T) {
dsn := os.Getenv("DATABASE_URL")
if dsn == "" {
t.Skip("DATABASE_URL is required")
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
defer func() { db = previousDB; tx.Rollback() }()
if err := tx.AutoMigrate(&Tea{}, &TeaTasting{}, &TeaRating{}, &User{}, &TastingTea{}); err != nil {
t.Fatal(err)
}
tea := Tea{TeaName: "Unrated", Source: fmt.Sprintf("membership-test-%d", time.Now().UnixNano())}
if err := tx.Create(&tea).Error; err != nil {
t.Fatal(err)
}
router := mux.NewRouter()
router.HandleFunc("/create-tasting", handleCreateTasting).Methods("POST")
router.HandleFunc("/tastings", handleTastings).Methods("GET")
router.HandleFunc("/tastings/{tastingId}/teas", handleAddTeaToTasting).Methods("POST")
router.HandleFunc("/tastings/{tastingId}/teas/{teaId}", handleUnlinkTeaFromTasting).Methods("DELETE")
call := func(method, path string, body []byte, want int) *httptest.ResponseRecorder {
t.Helper()
response := httptest.NewRecorder()
router.ServeHTTP(response, httptest.NewRequest(method, path, bytes.NewReader(body)))
if response.Code != want {
t.Fatalf("%s %s got %d want %d: %s", method, path, response.Code, want, response.Body.String())
}
return response
}
name := fmt.Sprintf("Unrated tasting %d", time.Now().UnixNano())
payload, _ := json.Marshal(map[string]interface{}{"name": name, "tea_ids": []uint{tea.ID}})
response := call("POST", "/create-tasting", payload, http.StatusCreated)
var created TeaTasting
if err := json.Unmarshal(response.Body.Bytes(), &created); err != nil {
t.Fatal(err)
}
if created.ID == 0 || len(created.TeaIDs) != 1 || created.TeaIDs[0] != tea.ID {
t.Fatalf("unexpected created tasting: %+v", created)
}
checkLinks := func(want int) {
t.Helper()
response := call("GET", "/tastings", nil, http.StatusOK)
var tastings []TeaTasting
if err := json.Unmarshal(response.Body.Bytes(), &tastings); err != nil {
t.Fatal(err)
}
for _, item := range tastings {
if item.ID == created.ID {
if len(item.TeaIDs) != want {
t.Fatalf("links: got %v want %d", item.TeaIDs, want)
}
return
}
}
t.Fatal("created tasting missing")
}
checkLinks(1)
path := fmt.Sprintf("/tastings/%d/teas/%d", created.ID, tea.ID)
call("DELETE", path, nil, http.StatusOK)
checkLinks(0)
addPath := fmt.Sprintf("/tastings/%d/teas", created.ID)
addPayload, _ := json.Marshal(map[string]uint{"tea_id": tea.ID})
call("POST", addPath, addPayload, http.StatusCreated)
checkLinks(1)
call("DELETE", path, nil, http.StatusOK)
checkLinks(0)
}
