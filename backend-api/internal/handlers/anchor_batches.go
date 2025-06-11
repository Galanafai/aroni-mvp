package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/labstack/echo/v4"
)

type AnchorBatchView struct {
	MerkleRoot string    `json:"merkle_root"`
	ScanCount  int       `json:"scan_count"`
	AnchoredAt time.Time `json:"anchored_at"`
}

func ListAnchorBatches(c echo.Context) error {
	files, err := os.ReadDir("anchored")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "could not read anchored directory"})
	}

	batches := []AnchorBatchView{}
	seen := map[string]bool{}

	for _, f := range files {
		name := f.Name()
		if filepath.Ext(name) == ".ots" {
			root := name[:len(name)-4]
			if seen[root] {
				continue
			}
			seen[root] = true

			info, err := os.Stat(filepath.Join("anchored", name))
			if err != nil {
				continue
			}

			batches = append(batches, AnchorBatchView{
				MerkleRoot: root,
				ScanCount:  100, // Placeholder
				AnchoredAt: info.ModTime(),
			})
		}
	}

	return c.JSON(http.StatusOK, echo.Map{"data": batches})
}
