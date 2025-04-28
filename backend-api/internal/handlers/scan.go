package handlers

import (
	
	"fmt"
	"net/http"


	"github.com/go-playground/validator/v10"
	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/galanafai/aroni-backend/internal/models"
	"github.com/labstack/echo/v4"
)

var scanValidator = validator.New()

func HandleScan(c echo.Context) error {
	var payload models.ScanPayload

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid JSON"})
	}

	if err := scanValidator.Struct(payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "validation failed", "details": err.Error()})
	}

	result := "pending"
	reasons := []string{}

	// In future: you can validate fields here by fetching metadata

	// Log the scan immediately
	err := db.PostScanLog(map[string]interface{}{
		"tracking_id":         payload.TrackingID,
		"location":            payload.Location,
		"scanned_quantity":    payload.ScannedQuantity,
		"scanned_weight_kg":   payload.ScannedWeightKg,
		"scanned_dimensions":  payload.ScannedDimensions,
		"result":              result,
		"notes":               reasonsToString(reasons),
	})
	if err != nil {
		c.Logger().Errorf("❌ Failed to log scan: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to log scan"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Scan logged successfully",
	})
}


func reasonsToString(reasons []string) string {
	if len(reasons) == 0 {
		return ""
	}
	return fmt.Sprintf("%v", reasons)
}
