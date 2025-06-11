package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"

	"github.com/galanafai/aroni-backend/internal/models"
)

func HashScan(scan models.ScanLog) string {
	data, _ := json.Marshal(struct {
		TrackingID        string  `json:"tracking_id"`
		ScanTime          string  `json:"scan_time"`
		Location          string  `json:"location"`
		ScannedQuantity   int     `json:"scanned_quantity"`
		ScannedWeightKg   float64 `json:"scanned_weight_kg"`
		ScannedDimensions []int   `json:"scanned_dimensions"`
		Result            string  `json:"result"`
		Notes             string  `json:"notes"`
	}{
		TrackingID:        scan.TrackingID,
		ScanTime:          scan.ScanTime.Format("2006-01-02T15:04:05Z07:00"),
		Location:          scan.Location,
		ScannedQuantity:   scan.ScannedQuantity,
		ScannedWeightKg:   scan.ScannedWeightKg,
		ScannedDimensions: scan.ScannedDimensions,
		Result:            scan.Result,
		Notes:             scan.Notes,
	})

	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}
