package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
)

func DownloadProof(c echo.Context) error {
	scanHash := c.Param("scan_hash")
	format := c.QueryParam("format")

	if scanHash == "" || (format != "json" && format != "ots") {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid scan_hash or format"})
	}

	if format == "json" {
		proof, err := db.GetScanProof(scanHash)
		if err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "Proof not found"})
		}

		payload := map[string]interface{}{
			"scan_hash":   proof.ScanHash,
			"root_hash":   proof.RootHash,
			"proof_path":  proof.ProofPath,
			"tracking_id": proof.TrackingID,
		}

		bytes, _ := json.MarshalIndent(payload, "", "  ")
		c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s_proof.json\"", scanHash))
		c.Response().Header().Set("Content-Type", "application/json")
		return c.Blob(http.StatusOK, "application/json", bytes)
	}

	if format == "ots" {
		path := filepath.Join("anchored", fmt.Sprintf("%s.ots", scanHash))
		file, err := os.Open(path)
		if err != nil {
			if os.IsNotExist(err) {
				return c.JSON(http.StatusNotFound, echo.Map{"error": "OTS file not found"})
			}
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to open OTS file"})
		}
		defer file.Close()

		c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s.ots\"", scanHash))
		c.Response().Header().Set("Content-Type", "application/octet-stream")
		return c.Stream(http.StatusOK, "application/octet-stream", file)
	}

	return c.JSON(http.StatusBadRequest, echo.Map{"error": "Unsupported format"})
}
