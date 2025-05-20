package db

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type AnchorBatch struct {
	RootHash    string   `json:"root_hash"`
	ScanCount   int      `json:"scan_count"`
	TrackingIDs []string `json:"included_tracking_ids"`
	Note        string   `json:"note"`
	AnchoredAt  string   `json:"batch_timestamp"` // ← THIS FIXES IT
}

func FetchLatestAnchorBatch() (*AnchorBatch, error) {
	url := fmt.Sprintf("%s/scan_batch?select=*&order=batch_timestamp.desc&limit=1", supabaseAPIURL)

	req, err := http.NewRequestWithContext(context.Background(), "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body) // Capture the error body for debugging
		return nil, fmt.Errorf("supabase error %d: %s", resp.StatusCode, body)
	}

	var records []AnchorBatch
	err = json.NewDecoder(resp.Body).Decode(&records)
	if err != nil {
		return nil, fmt.Errorf("failed to decode anchor batch response: %w", err)
	}

	if len(records) == 0 {
		return nil, nil
	}

	return &records[0], nil
}
