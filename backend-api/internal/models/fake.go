package models

import "time"

type ScanLog struct {
	ID                string    `json:"id,omitempty"`
	TrackingID        string    `json:"tracking_id"`
	ScanTime          time.Time `json:"scan_time"`
	Location          string    `json:"location"`
	ScannedQuantity   int       `json:"scanned_quantity"`
	ScannedWeightKg   float64   `json:"scanned_weight_kg"`
	ScannedDimensions []int     `json:"scanned_dimensions"`
	Result            string    `json:"result"`
	Notes             string    `json:"notes"`
	ScanHash          *string   `json:"scan_hash,omitempty"`
}
