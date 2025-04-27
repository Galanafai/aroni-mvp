package models

import "github.com/google/uuid"


type ScanPayload struct {
	TrackingID         uuid.UUID    `json:"tracking_id" validate:"required,uuid4"`
	ScannedQuantity    int       `json:"scanned_quantity" validate:"required,gte=0"`
	ScannedWeightKg    float64   `json:"scanned_weight_kg" validate:"required,gte=0"`
	ScannedDimensions  []float64 `json:"scanned_dimensions_cm" validate:"required,dive,gte=0"`
	Location           string    `json:"location"` // optional
}
