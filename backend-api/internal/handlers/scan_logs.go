package handlers

import (
	"net/http"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
)

func GetAllScanLogs(c echo.Context) error {
	scans, err := db.FetchAllScans()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to fetch scan logs"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"data": scans,
	})
}
