package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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
