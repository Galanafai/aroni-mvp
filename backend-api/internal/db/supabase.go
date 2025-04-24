package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/galanafai/aroni-backend/internal/models"
)

var conn *pgx.Conn

func InitDB() error {
	url := os.Getenv("SUPABASE_DB_URL")
	if url == "" {
		return fmt.Errorf("SUPABASE_DB_URL not set")
	}

	var err error
	conn, err = pgx.Connect(context.Background(), url)
	if err != nil {
		return fmt.Errorf("failed to connect to DB: %w", err)
	}

	return nil
}

func SaveMetadata(payload models.MetadataPayload) error {
	_, err := conn.Exec(context.Background(), `
		insert into metadata (
			sku, quantity, weight_kg, dimensions_cm,
			package_type, source_id, destination_id,
			carrier_id, urgency_level, hs_code,
			tracking_id, timestamp, nested_within
		) values (
			$1, $2, $3, $4,
			$5, $6, $7,
			$8, $9, $10,
			$11, $12, $13
		)
	`,
		payload.SKU,
		payload.Quantity,
		payload.WeightKg,
		payload.Dimensions,
		payload.PackageType,
		payload.SourceID,
		payload.DestinationID,
		payload.CarrierID,
		payload.UrgencyLevel,
		payload.HSCode,
		payload.TrackingID,
		payload.Timestamp,
		payload.NestedWithin,
	)
	return err
}
