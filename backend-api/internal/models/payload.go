package models

import "github.com/google/uuid"


type MetadataPayload struct {
	SKU          string    `json:"sku" validate:"required"`
	Quantity     int       `json:"quantity" validate:"required,gte=0"`
	WeightKg     float64   `json:"weight_kg" validate:"required,gte=0"`
	Dimensions   []float64 `json:"dimensions_cm" validate:"required,dive,gte=0"`
	PackageType  string    `json:"package_type" validate:"required"`
	SourceID     string    `json:"source_id" validate:"required"`
	DestinationID string   `json:"destination_id" validate:"required"`
	CarrierID    string    `json:"carrier_id"`
	UrgencyLevel string    `json:"urgency_level" validate:"required,oneof=normal priority critical"`
	HSCode       string    `json:"hs_code" validate:"required"`
	TrackingID   uuid.UUID    `json:"tracking_id" validate:"required,uuid4"`
	Timestamp    string    `json:"timestamp" validate:"required,datetime=2006-01-02T15:04:05Z07:00"`
	NestedWithin string    `json:"nested_within"`
}
