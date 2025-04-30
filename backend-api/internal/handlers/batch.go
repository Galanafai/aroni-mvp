package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
)

// BuildMerkleRoot generates a simple root hash by sorting and hashing the concatenated hashes.
func BuildMerkleRoot(hashes []string) string {
	sort.Strings(hashes)
	combined := strings.Join(hashes, "")
	hash := sha256.Sum256([]byte(combined))
	return hex.EncodeToString(hash[:])
}

// AnchorBatch handles batch creation, Merkle root calculation, and saving to scan_batch.
func AnchorBatch(c echo.Context) error {
	hashes, ids, err := db.FetchRecentScanHashesForBatch()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to fetch scan hashes"})
	}

	if len(hashes) == 0 {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "no scan hashes found"})
	}

	root := BuildMerkleRoot(hashes)
	note := c.FormValue("note")
	if note == "" {
		note = "Batch anchored at " + time.Now().UTC().Format(time.RFC3339)
	}

	err = db.SaveBatchRoot(root, len(hashes), ids, note)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to save batch root"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"root_hash":    root,
		"scan_count":   len(hashes),
		"tracking_ids": ids,
		"note":         note,
	})
}
