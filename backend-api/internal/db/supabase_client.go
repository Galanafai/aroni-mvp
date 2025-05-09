package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

var supabaseAPIURL string
var supabaseKey string

func InitSupabaseClient() {
	supabaseAPIURL = os.Getenv("SUPABASE_API_URL")
	supabaseKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseAPIURL == "" || supabaseKey == "" {
		panic("Missing Supabase API URL or Service Key in .env")
	}
}

func PostMetadata(payload any) error {
	url := fmt.Sprintf("%s/metadata", supabaseAPIURL)

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	req, err := http.NewRequestWithContext(context.Background(), "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("supabase responded with status %d", resp.StatusCode)
	}

	return nil
}

func PostScanLog(payload any) error {
	url := fmt.Sprintf("%s/scan_log", supabaseAPIURL)

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal scan log: %w", err)
	}

	req, err := http.NewRequestWithContext(context.Background(), "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("supabase responded with status %d", resp.StatusCode)
	}

	return nil
}

type MetadataRecord struct {
	SKU           string    `json:"sku"`
	Quantity      int       `json:"quantity"`
	WeightKg      float64   `json:"weight_kg"`
	DimensionsCm  []float64 `json:"dimensions_cm"`
	PackageType   string    `json:"package_type"`
	SourceID      string    `json:"source_id"`
	DestinationID string    `json:"destination_id"`
	CarrierID     string    `json:"carrier_id"`
	UrgencyLevel  string    `json:"urgency_level"`
	HSCode        string    `json:"hs_code"`
	TrackingID    string    `json:"tracking_id"`
	Timestamp     string    `json:"timestamp"`
	NestedWithin  string    `json:"nested_within"`
}

func FetchMetadataByTrackingID(trackingID string) (*MetadataRecord, error) {
	url := fmt.Sprintf("%s/metadata?tracking_id=eq.%s", supabaseAPIURL, trackingID)

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

	if resp.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("supabase error %d: %s", resp.StatusCode, body)
	}

	var records []MetadataRecord
	err = json.NewDecoder(resp.Body).Decode(&records)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(records) == 0 {
		return nil, nil
	}

	return &records[0], nil
}

func FetchScanHistory(trackingID string) ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/scan_log?tracking_id=eq.%s&order=scan_time.desc", supabaseAPIURL, trackingID)

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
		return nil, fmt.Errorf("supabase error %d", resp.StatusCode)
	}

	var history []map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&history)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return history, nil
}

func FetchRecentScanHashesForBatch() ([]string, []string, error) {
	url := fmt.Sprintf("%s/scan_log?select=scan_hash,tracking_id", supabaseAPIURL)

	req, err := http.NewRequestWithContext(context.Background(), "GET", url, nil)
	if err != nil {
		return nil, nil, err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	var raw []map[string]string
	err = json.NewDecoder(resp.Body).Decode(&raw)
	if err != nil {
		return nil, nil, err
	}

	var hashes []string
	var ids []string
	for _, r := range raw {
		if r["scan_hash"] != "" {
			hashes = append(hashes, r["scan_hash"])
			ids = append(ids, r["tracking_id"])
		}
	}
	return hashes, ids, nil
}
func SaveBatchRoot(rootHash string, count int, trackingIDs []string, note string) error {
	payload := map[string]interface{}{
		"root_hash":             rootHash,
		"scan_count":            count,
		"included_tracking_ids": trackingIDs,
		"note":                  note,
	}

	body, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/scan_batch", supabaseAPIURL)

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
func FetchAllScans() ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/scan_log?order=scan_time.desc", supabaseAPIURL)

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
		return nil, fmt.Errorf("failed to fetch scans: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("supabase error %d: %s", resp.StatusCode, body)
	}

	var scans []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&scans); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return scans, nil
}
