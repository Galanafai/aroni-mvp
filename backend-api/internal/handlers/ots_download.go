package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
)

func DownloadOTS(c echo.Context) error {
	scanHash := c.Param("scan_hash")
	path := filepath.Join("anchored", fmt.Sprintf("%s.ots", scanHash))

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return c.JSON(http.StatusNotFound, echo.Map{"message": "OTS file not found"})
	}

	return c.Attachment(path, scanHash+".ots")
}
