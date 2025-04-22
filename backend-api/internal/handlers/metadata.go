package handlers

import (
	"github.com/galanafai/aroni-backend/internal/models"
	"github.com/labstack/echo/v4"
	"net/http"
)

func HandleMetadata(c echo.Context) error {
	var payload models.MetadataPayload

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid JSON"})
	}

	c.Logger().Infof("Received metadata: %+v", payload)

	return c.JSON(http.StatusOK, echo.Map{"message": "Metadata received successfully"})
}
