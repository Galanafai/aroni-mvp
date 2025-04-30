package handlers

import (
	"net/http"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
)

func GetScanHistory(c echo.Context) error {
	trackingID := c.Param("tracking_id")

	history, err := db.FetchScanHistory(trackingID)
	if err != nil {
		c.Logger().Errorf("❌ Failed to fetch scan history: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch scan history"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"tracking_id": trackingID,
		"history":     history,
	})
}
