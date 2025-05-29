package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type ScanProof struct {
	ScanHash   string   `json:"scan_hash"`
	RootHash   string   `json:"root_hash"`
	TrackingID string   `json:"tracking_id"`
	ProofPath  []string `json:"proof_path"`
}

func SaveScanProof(scanHash, rootHash, trackingID string, proof []string) error {
	payload := map[string]interface{}{
		"scan_hash":   scanHash,
		"root_hash":   rootHash,
		"tracking_id": trackingID,
		"proof_path":  proof,
	}

	body, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/scan_proofs", supabaseAPIURL)

	req, err := http.NewRequestWithContext(context.Background(), "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("supabase error %d", resp.StatusCode)
	}
	return nil
}

func GetScanProof(scanHash string) (*ScanProof, error) {
	url := fmt.Sprintf("%s/scan_proofs?scan_hash=eq.%s", supabaseAPIURL, scanHash)

	req, err := http.NewRequestWithContext(context.Background(), "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("supabase error %d", resp.StatusCode)
	}

	var results []ScanProof
	err = json.NewDecoder(resp.Body).Decode(&results)
	if err != nil || len(results) == 0 {
		return nil, fmt.Errorf("proof not found")
	}

	return &results[0], nil
}
