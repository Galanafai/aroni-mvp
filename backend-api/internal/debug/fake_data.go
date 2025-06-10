// internal/debug/fake_data.go
package debug

import (
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/galanafai/aroni-backend/internal/handlers"
	"github.com/galanafai/aroni-backend/internal/models"
)

var locations = []string{"Dock A", "Warehouse", "Outbound", "Yard 7"}

func GenerateFakeScans(c echo.Context) error {
	countParam := c.QueryParam("count")
	if countParam == "" {
		countParam = "500"
	}
	count, err := strconv.Atoi(countParam)
	if err != nil || count <= 0 {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid count"})
	}

	successful := 0
	anchored := 0

	for i := 0; i < count; i++ {
		trackingID := uuid.New()

		meta := db.MetadataRecord{
			SKU:           "SKU-" + strconv.Itoa(rand.Intn(10000)),
			Quantity:      rand.Intn(200) + 1,
			WeightKg:      rand.Float64()*90 + 10,
			DimensionsCm:  []float64{rand.Float64() * 50, rand.Float64() * 50, rand.Float64() * 50},
			PackageType:   "box",
			SourceID:      "SRC-" + strconv.Itoa(rand.Intn(100)),
			DestinationID: "DST-" + strconv.Itoa(rand.Intn(100)),
			CarrierID:     "FAKE-CARRIER",
			UrgencyLevel:  "normal",
			HSCode:        "000000",
			TrackingID:    trackingID.String(),
			Timestamp:     time.Now().UTC().Format(time.RFC3339),
			NestedWithin:  "",
		}
		if err := db.PostMetadata(meta); err != nil {
			c.Logger().Errorf("❌ Failed to insert metadata: %v", err)
			continue
		}

		for j := 0; j < 1+(rand.Intn(3)); j++ {
			match := rand.Intn(4) != 0 // 75% chance match
			result := "match"
			notes := ""
			if !match {
				result = "mismatch"
				notes = "simulated mismatch"
			}

			scan := models.ScanLog{
				TrackingID:        trackingID.String(),
				ScanTime:          time.Now().Add(-time.Duration(rand.Intn(5000)) * time.Second),
				Location:          locations[rand.Intn(len(locations))],
				ScannedQuantity:   rand.Intn(10) + 1,
				ScannedWeightKg:   rand.Float64()*90 + 1,
				ScannedDimensions: []int{rand.Intn(40) + 1, rand.Intn(40) + 1, rand.Intn(40) + 1},
				Result:            result,
				Notes:             notes,
			}
			if err := db.PostScanLog(scan); err != nil {
				c.Logger().Errorf("❌ Failed to insert scan: %v", err)
				continue
			}

			successful++

			if successful%100 == 0 {
				c.Logger().Infof("🧱 Auto-anchoring after %d scans", successful)
				if err := handlers.AnchorBatch(c); err == nil {
					anchored++
				} else {
					c.Logger().Warnf("⚠️ Anchor failed: %v", err)
				}
			}
		}
	}

	return c.JSON(http.StatusOK, echo.Map{
		"total_scans":      successful,
		"batches_anchored": anchored,
	})
}
