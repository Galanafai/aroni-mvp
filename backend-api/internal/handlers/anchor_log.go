package handlers

import (
	"net/http"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
)

// GetLatestAnchor returns the most recent Merkle root batch info
func GetLatestAnchor(c echo.Context) error {
	// Call DB utility to fetch latest batch from Supabase
	latest, err := db.FetchLatestAnchorBatch()
	if err != nil {
		c.Logger().Errorf("❌ Failed to fetch latest anchor batch: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch anchor batch",
		})
	}

	if latest == nil {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": "No anchor batches found",
		})
	}

	// Return latest anchor batch as JSON
	return c.JSON(http.StatusOK, echo.Map{
		"root_hash":    latest.RootHash,
		"count":        latest.ScanCount,
		"tracking_ids": latest.TrackingIDs,
		"note":         latest.Note,
		"anchored_at":  latest.AnchoredAt,
	})
}
