package handlers

import (
	"net/http"

	"github.com/galanafai/aroni-backend/internal/crypto"
	"github.com/labstack/echo/v4"
)

type VerifyScanPayload struct {
	ScanHash string   `json:"scan_hash"`
	Proof    []string `json:"proof"`
	RootHash string   `json:"root_hash"`
}

// VerifyScan handles Merkle proof verification
func VerifyScan(c echo.Context) error {
	var payload VerifyScanPayload
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	valid, err := crypto.VerifyProof(payload.ScanHash, payload.Proof, payload.RootHash)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"valid": valid,
	})
}
