package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/galanafai/aroni-backend/internal/crypto"
	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/galanafai/aroni-backend/internal/utils"
	"github.com/labstack/echo/v4"
)

// BuildMerkleRoot generates a simple root hash by sorting and hashing the concatenated hashes.
func BuildMerkleRoot(hashes []string) string {
	sort.Strings(hashes)
	combined := strings.Join(hashes, "")
	hash := sha256.Sum256([]byte(combined))
	return hex.EncodeToString(hash[:])
}

// AnchorBatch handles batch creation, Merkle root calculation, OTS anchoring, and proof saving.
func AnchorBatch(c echo.Context) error {
	hashes, trackingIDs, err := db.FetchRecentScanHashesForBatch()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to fetch scan hashes"})
	}
	if len(hashes) == 0 {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "no scan hashes found"})
	}

	// Compute Merkle root
	root := BuildMerkleRoot(hashes)
	note := c.FormValue("note")
	if note == "" {
		note = "Batch anchored at " + time.Now().UTC().Format(time.RFC3339)
	}

	// Save root to scan_batch
	if err := db.SaveBatchRoot(root, len(hashes), trackingIDs, note); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to save batch root"})
	}

	// 🔗 Anchor to Bitcoin using OpenTimestamps
	if err := utils.AnchorRootHashOTS(root, fmt.Sprintf("anchored/%s", root)); err != nil {
		c.Logger().Errorf("❌ Failed to anchor root hash to Bitcoin: %v", err)
	} else {
		c.Logger().Infof("🔗 Root hash %s anchored to Bitcoin via OTS", root)
	}

	// 🧠 Build Merkle tree and save per-scan proof paths
	tree, err := crypto.BuildMerkleTree(hashes)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to build Merkle tree"})
	}

	for i, scanHash := range hashes {
		proof, err := tree.GetProof(i)
		if err != nil {
			c.Logger().Warnf("⚠️ Failed to get proof for %s: %v", scanHash, err)
			continue
		}
		if err := db.SaveScanProof(scanHash, root, trackingIDs[i], proof); err != nil {
			c.Logger().Warnf("⚠️ Failed to save proof for %s: %v", scanHash, err)
		}
	}

	// ✅ Final success response
	return c.JSON(http.StatusOK, echo.Map{
		"root":         root,
		"count":        len(hashes),
		"tracking_ids": trackingIDs,
		"note":         note,
	})
}
