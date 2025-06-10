package utils

import (
	"fmt"
	"os"
	"os/exec"
)

// AnchorRootHashOTS writes the root hash to a file and anchors it using OpenTimestamps CLI
func AnchorRootHashOTS(rootHash string, outputPath string) error {
	otsFile := outputPath + ".ots"

	// ✅ Skip if already anchored
	if _, err := os.Stat(otsFile); err == nil {
		fmt.Printf("🔁 Skipping OTS stamp — %s already exists\n", otsFile)
		return nil
	}

	// ✅ Write root hash directly to file
	err := os.WriteFile(outputPath, []byte(rootHash), 0644)
	if err != nil {
		return fmt.Errorf("failed to write root hash to file: %v", err)
	}

	// ✅ Run ots stamp
	cmd := exec.Command("ots", "stamp", outputPath)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ots stamp failed: %v\n%s", err, out)
	}

	// ✅ Verify .ots file was created
	if _, err := os.Stat(otsFile); err != nil {
		return fmt.Errorf("ots file not created: %v", err)
	}

	return nil
}
