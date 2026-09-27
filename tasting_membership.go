package main

import (
 "encoding/json"
 "errors"
 "net/http"

 "github.com/gorilla/mux"
 "gorm.io/gorm"
 "gorm.io/gorm/clause"
)

// TastingTea is independent of ratings so unrated teas stay in a tasting.
type TastingTea struct {
 TastingID uint `json:"tasting_id" gorm:"primaryKey"`
 TeaID uint `json:"tea_id" gorm:"primaryKey"`
}

func linkTastingTea(tx *gorm.DB, tastingID, teaID uint) error {
 return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&TastingTea{TastingID:tastingID, TeaID:teaID}).Error
}

func handleAddTeaToTasting(w http.ResponseWriter, r *http.Request) {
 tastingID, valid := parsePositiveID(mux.Vars(r)["tastingId"])
 if !valid { http.Error(w,"Invalid tasting ID",http.StatusBadRequest); return }
 var request struct { TeaID uint `json:"tea_id"` }
 if err:=json.NewDecoder(r.Body).Decode(&request); err!=nil || request.TeaID==0 { http.Error(w,"Invalid tea ID",http.StatusBadRequest); return }
 var tasting TeaTasting
 if err:=db.First(&tasting,tastingID).Error; err!=nil {
  if errors.Is(err,gorm.ErrRecordNotFound) { http.Error(w,"Tasting not found",http.StatusNotFound) } else { http.Error(w,"Could not check tasting",http.StatusInternalServerError) }; return
 }
 var tea Tea
 if err:=db.First(&tea,request.TeaID).Error; err!=nil {
  if errors.Is(err,gorm.ErrRecordNotFound) { http.Error(w,"Tea not found",http.StatusNotFound) } else { http.Error(w,"Could not check tea",http.StatusInternalServerError) }; return
 }
 if err:=linkTastingTea(db,tastingID,request.TeaID); err!=nil { http.Error(w,"Failed to add tea",http.StatusInternalServerError); return }
 w.Header().Set("Content-Type","application/json")
 w.WriteHeader(http.StatusCreated)
 json.NewEncoder(w).Encode(map[string]uint{"tasting_id":tastingID,"tea_id":request.TeaID})
}
