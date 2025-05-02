package crypto

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sort"
)

// MerkleTree represents the full tree with proofs
type MerkleTree struct {
	Leaves [][]byte
	Levels [][][]byte // Each level of the tree
}

// BuildMerkleTree creates a Merkle tree from sorted scan_hashes
func BuildMerkleTree(hashes []string) (*MerkleTree, error) {
	if len(hashes) == 0 {
		return nil, errors.New("no hashes provided")
	}

	sort.Strings(hashes)
	leaves := [][]byte{}
	for _, h := range hashes {
		b, err := hex.DecodeString(h)
		if err != nil {
			return nil, err
		}
		leaves = append(leaves, b)
	}

	tree := &MerkleTree{Leaves: leaves, Levels: [][][]byte{leaves}}

	current := leaves
	for len(current) > 1 {
		next := [][]byte{}
		for i := 0; i < len(current); i += 2 {
			if i+1 < len(current) {
				combined := append(current[i], current[i+1]...)
				h := sha256.Sum256(combined)
				next = append(next, h[:])
			} else {
				next = append(next, current[i])
			}
		}
		tree.Levels = append(tree.Levels, next)
		current = next
	}

	return tree, nil
}

// Root returns the Merkle root of the tree
func (m *MerkleTree) Root() string {
	if len(m.Levels) == 0 {
		return ""
	}
	return hex.EncodeToString(m.Levels[len(m.Levels)-1][0])
}

// GetProof returns the Merkle proof path for a specific leaf index
func (m *MerkleTree) GetProof(index int) ([]string, error) {
	if index < 0 || index >= len(m.Leaves) {
		return nil, errors.New("invalid index")
	}

	proof := []string{}
	for level := 0; level < len(m.Levels)-1; level++ {
		siblingIndex := index ^ 1
		if siblingIndex < len(m.Levels[level]) {
			proof = append(proof, hex.EncodeToString(m.Levels[level][siblingIndex]))
		}
		index = index / 2
	}
	return proof, nil
}

// VerifyProof checks if a given leaf + proof leads to the expected root
func VerifyProof(leafHash string, proof []string, root string) (bool, error) {
	b, err := hex.DecodeString(leafHash)
	if err != nil {
		return false, err
	}

	computed := b
	for _, p := range proof {
		sibling, err := hex.DecodeString(p)
		if err != nil {
			return false, err
		}

		var combined []byte
		if bytes.Compare(computed, sibling) < 0 {
			combined = append(computed, sibling...)
		} else {
			combined = append(sibling, computed...)
		}

		h := sha256.Sum256(combined)
		computed = h[:]
	}

	return hex.EncodeToString(computed) == root, nil
}
