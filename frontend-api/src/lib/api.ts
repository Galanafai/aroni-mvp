// src/lib/api.ts

const API_URL = "http://localhost:8080/api"; // or your actual deployment URL

// Fetch a list of all scans (used in Dashboard)
export const getScans = async () => {
  try {
    const res = await fetch(`${API_URL}/scans`);
    const json = await res.json();
    console.log("📦 [API] Response from /scans:", json);
    return json.data;
  } catch (error) {
    console.error("❌ [API] Failed to fetch scans:", error);
    return [];
  }
};

// Fetch scan history for a specific tracking ID
export async function fetchScanHistory(trackingId: string) {
  try {
    const res = await fetch(`${API_URL}/scan-history/${trackingId}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Failed to fetch scan history:", err);
    return null;
  }
}

// Submit a scan
export async function submitScan(scan: {
  tracking_id: string;
  scanned_quantity: number;
  scanned_weight_kg: number;
  scanned_dimensions_cm: number[];
  location: string;
}) {
  const res = await fetch(`${API_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scan),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Scan submission failed");
  }

  return await res.json();
}
