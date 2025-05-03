package utils

import (
	"fmt"
	"os"
	"os/exec"
)

// AnchorRootHashOTS writes the root hash to a file and anchors it using OpenTimestamps CLI
func AnchorRootHashOTS(rootHash string, outputBase string) error {
	// Write root hash to a temp file
	txtFile := fmt.Sprintf("%s.txt", outputBase)
	err := os.WriteFile(txtFile, []byte(rootHash), 0644)
	if err != nil {
		return fmt.Errorf("failed to write root hash to file: %v", err)
	}

	// Run ots stamp command
	cmd := exec.Command("ots", "stamp", txtFile)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ots stamp failed: %v\n%s", err, out)
	}

	// Confirm the .ots file was created
	otsFile := fmt.Sprintf("%s.ots", txtFile)
	if _, err := os.Stat(otsFile); err != nil {
		return fmt.Errorf("ots file not created: %v", err)
	}

	return nil
}
