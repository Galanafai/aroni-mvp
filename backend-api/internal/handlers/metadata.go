package handlers

import (
	"strings"
	"github.com/go-playground/validator/v10"
	"github.com/galanafai/aroni-backend/internal/models"
	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
	"net/http"
)

var validate = validator.New()

func HandleMetadata(c echo.Context) error {
	var payload models.MetadataPayload

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid JSON"})
	}

	if err := validate.Struct(payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "validation failed", "details": err.Error()})
	}

	err := db.PostMetadata(payload)
	if err != nil {
		if strings.Contains(err.Error(), "409") {
			return c.JSON(http.StatusConflict, echo.Map{"error": "Tracking ID already exists"})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save metadata", "details": err.Error()})
	}


	c.Logger().Infof("✅ Valid payload: %+v", payload)

	return c.JSON(http.StatusOK, echo.Map{"message": "Metadata received successfully"})
}
