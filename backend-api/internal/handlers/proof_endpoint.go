package handlers

import (
	"net/http"

	"github.com/galanafai/aroni-backend/internal/crypto"
	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/labstack/echo/v4"
)

// GetProofForScan returns the Merkle proof path for a given scan hash
func GetProofForScan(c echo.Context) error {
	scanHash := c.Param("scan_hash")

	// 1. Fetch all scan_hashes + tracking_ids from the most recent batch
	hashes, trackingIDs, err := db.FetchRecentScanHashesForBatch()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to fetch batch scan hashes"})
	}

	// 2. Rebuild Merkle tree
	tree, err := crypto.BuildMerkleTree(hashes)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to build Merkle tree"})
	}

	// 3. Find index of scanHash
	leafIndex := -1
	for i, h := range hashes {
		if h == scanHash {
			leafIndex = i
			break
		}
	}
	if leafIndex == -1 {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "scan_hash not found in batch"})
	}

	// 4. Get proof path
	proof, err := tree.GetProof(leafIndex)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to generate Merkle proof"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"scan_hash":   scanHash,
		"proof":       proof,
		"root_hash":   tree.Root(),
		"tracking_id": trackingIDs[leafIndex],
	})
}
