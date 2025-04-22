package models

type MetadataPayload struct {
	SKU         string    `json:"sku"`
	Quantity    int       `json:"quantity"`
	Weight      float64   `json:"weight"`
	Dimensions  []float64 `json:"dimensions_cm"`
	Destination string    `json:"destination"`
}
