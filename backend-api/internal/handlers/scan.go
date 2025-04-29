package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/galanafai/aroni-backend/internal/models"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

var scanValidator = validator.New()

func HandleScan(c echo.Context) error {
	var payload models.ScanPayload
	scanTime := time.Now().UTC()

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid JSON"})
	}

	if err := scanValidator.Struct(payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "validation failed", "details": err.Error()})
	}

	// ✅ Fetch stored metadata
	stored, err := db.FetchMetadataByTrackingID(payload.TrackingID.String())
	if err != nil {
		c.Logger().Errorf("❌ Failed to fetch metadata: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to fetch metadata"})
	}
	if stored == nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "tracking ID not found"})
	}

	// ✅ Compare fields
	result := "match"
	reasons := []string{}

	if stored.Quantity != payload.ScannedQuantity {
		result = "mismatch"
		reasons = append(reasons, "quantity mismatch")
	}
	if stored.WeightKg != payload.ScannedWeightKg {
		result = "mismatch"
		reasons = append(reasons, "weight mismatch")
	}
	if len(stored.DimensionsCm) == 3 && len(payload.ScannedDimensions) == 3 {
		for i := range stored.DimensionsCm {
			if stored.DimensionsCm[i] != payload.ScannedDimensions[i] {
				result = "mismatch"
				reasons = append(reasons, "dimensions mismatch")
				break
			}
		}
	} else {
		result = "mismatch"
		reasons = append(reasons, "dimensions format mismatch")
	}

	// ✅ Log the scan result
	scanLog := map[string]interface{}{
		"tracking_id":        payload.TrackingID,
		"location":           payload.Location,
		"scanned_quantity":   payload.ScannedQuantity,
		"scanned_weight_kg":  payload.ScannedWeightKg,
		"scanned_dimensions": payload.ScannedDimensions,
		"result":             result,
		"notes":              reasonsToString(reasons),
		"scan_time":          scanTime.Format(time.RFC3339),
	}

	// 🔐 Compute scan hash
	scanLog["scan_hash"] = computeScanHash(scanLog)

	// ✅ Now log the scan
	err = db.PostScanLog(scanLog)

	if err != nil {
		c.Logger().Errorf("❌ Failed to log scan: %v", err)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"tracking_id": payload.TrackingID,
		"result":      result,
		"reasons":     reasons,
	})
}

func reasonsToString(reasons []string) string {
	if len(reasons) == 0 {
		return ""
	}
	return strings.Join(reasons, ", ")
}

func computeScanHash(payload map[string]interface{}) string {
	jsonBytes, _ := json.Marshal(payload)
	hash := sha256.Sum256(jsonBytes)
	return hex.EncodeToString(hash[:])
}
