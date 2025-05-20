# Aroni MVP

**Aroni** is a scan integrity and traceability platform that combines frontend QR metadata generation, backend scan validation, and cryptographic anchoring to provide supply chain transparency and operational confidence. This document is a complete, detailed explanation of the logic, architecture, and functionality across the Aroni MVP project.

---

## 🧠 Purpose & Core Concept

Aroni is designed to:

* Digitally fingerprint physical packages using QR codes
* Log every interaction (scan) with those packages
* Detect mismatches in real-world vs. expected metadata
* Anchor those scan logs into a tamper-proof, trustable record using Merkle Trees and (optionally) blockchain

It enables real-time verification and auditability of goods moving across a supply chain.

---

## 🏗️ Project Structure

```
aroni-mvp/
├── backend-api/               # Go-based API for handling scans and metadata
│   ├── cmd/main.go           # API entrypoint, route definitions
│   ├── handlers/             # HTTP handlers for routes
│   │   ├── scan.go
│   │   ├── scan_logs.go
│   │   ├── proof_endpoint.go
│   │   └── metadata.go
│   ├── internal/db/          # Supabase & in-memory DB integration
│   │   └── supabase_client.go
│   └── internal/crypto/      # Merkle tree construction
│       └── merkle.go
├── frontend/                 # React/Vite frontend
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── MetadataForm.tsx
│   │   ├── ScanSubmission.tsx
│   │   └── Dashboard.tsx
│   ├── App.tsx               # Route setup using react-router
│   └── components/           # Reusable UI widgets
├── qr-generator/             # Python QR generator
│   └── generate_qr.py
├── go.mod, go.sum
└── README.md                 # You're here
```

---

## 🚦 Full System Flow

### 1. **Metadata Submission (Frontend)**

* User fills out metadata for a package:

  * SKU, quantity, weight, dimensions, source/destination, urgency, etc.
* `tracking_id` is auto-generated using `uuidv4()`
* A timestamp is also attached.
* A QR code is generated using only the `tracking_id` or hashed metadata.
* The full metadata payload is POSTed to `POST /api/metadata`

### 2. **QR Label Is Printed**

* The generated QR is displayed for the user.
* It contains `{ tracking_id: <uuid> }`
* It is printed and physically attached to the package.

### 3. **Scan Verification (Frontend)**

* A human or CV system scans the QR, which returns a `tracking_id`
* User inputs actual measured values: weight, quantity, dimensions
* These are POSTed to `POST /api/scan`

### 4. **Scan Validation (Backend)**

* The backend fetches metadata from Supabase using the `tracking_id`
* Compares real scan data to metadata:

  * Tolerances may be applied
  * Records a `match` or `mismatch`
* Hashes the full scan payload
* Appends the hash to scan log

### 5. **Merkle Tree Anchoring (Optional)**

* Periodically or manually, a batch of scan logs is used to build a Merkle Tree
* The root hash can be published on-chain
* Proofs can be generated for each scan

---

## 🔐 Backend Modules

### `scan.go`

* Handles `POST /api/scan`
* Validates, hashes, and stores scan logs

### `scan_logs.go`

* Handles `GET /api/scans`
* Returns a list of all scan logs
* Used for the dashboard

### `metadata.go`

* Handles `POST /api/metadata`
* Inserts original package metadata into Supabase

### `proof_endpoint.go`

* Handles anchoring logic and Merkle root serving

### `supabase_client.go`

* All communication with Supabase REST API
* Uses `http.NewRequestWithContext`
* Fetches metadata, inserts logs, retrieves logs

### `merkle.go`

* Merkle tree construction from scan hashes
* Tree building rules:

  * Pad odd leaves
  * SHA256(left + right)
  * Return root + proof path

---

## 💻 Frontend Pages

### `Home.tsx`

* Top-level navigation to all major routes

### `MetadataForm.tsx`

* Lets user input metadata
* Auto-generates UUID + timestamp
* Displays a dynamic QR code
* Submits metadata to backend

### `ScanSubmission.tsx`

* User scans a package
* Enters observed values
* Submits to backend

### `Dashboard.tsx`

* Fetches all scans via `/api/scans`
* Shows:

  * match/mismatch result
  * anchor status (✔️ if `scan_hash` exists)
  * scan timestamp
  * quantity, dimensions, notes
  * tracking ID opens drawer for full detail
* Includes filtering: `match`, `mismatch`, `all`

---

## 📦 QR Code Structure

* At metadata submission:

```json
{ "tracking_id": "uuid-v4" }
```

* This ensures CV scanners can simply decode QR → use ID → fetch from backend
* You can optionally add a Merkle hash to the QR in the future:

```json
{ "tracking_id": "uuid", "hash": "sha256sum" }
```

---

## 🧪 Sample Payloads

### Metadata

```json
{
  "sku": "ARONI-1001",
  "quantity": 48,
  "weight_kg": 12.5,
  "dimensions_cm": [40, 30, 20],
  "package_type": "case",
  "source_id": "WAREHOUSE-22A",
  "destination_id": "PORT-CA-OAKLAND",
  "carrier_id": "CARRIER-DELTA-7",
  "urgency_level": "priority",
  "hs_code": "841810",
  "nested_within": "PALLET-0093",
  "tracking_id": "auto-generated",
  "timestamp": "2025-05-06T16:32:00Z"
}
```

### Scan Log

```json
{
  "tracking_id": "uuid",
  "scanned_quantity": 48,
  "scanned_weight_kg": 12.4,
  "scanned_dimensions_cm": [40, 30, 20],
  "location": "Dock A"
}
```

---

## 📊 Dashboard JSON Format (Returned by `/api/scans`)

```json
{
  "data": [
    {
      "id": "uuid",
      "tracking_id": "uuid",
      "result": "match",
      "location": "Dock A",
      "scanned_quantity": 48,
      "scanned_weight_kg": 12.4,
      "scanned_dimensions": [40, 30, 20],
      "scan_hash": "sha256...",
      "notes": "",
      "scan_time": "2025-05-06T17:00:00Z"
    }
  ]
}
```

---

## 🧪 Merkle Proof Sample

```json
{
  "scan_hash": "abc123",
  "root_hash": "def456",
  "proof": ["123a", "456b"],
  "tracking_id": "uuid"
}
```

---

## 🚀 What's Next

* Add `scan-history/:tracking_id` view to trace a package
* Add Merkle proof verification to dashboard
* Anchor Merkle root on-chain or using OTS timestamping
* Export scan log or proof sets to CSV/PDF

---

## 🛠 Tech Stack

| Layer    | Stack           |
| -------- | --------------- |
| Frontend | React (Vite)    |
| Backend  | Go (Echo)       |
| Storage  | Supabase REST   |
| QR       | react-qr-code   |
| Hashing  | SHA256 + Merkle |

---

## 🤝 Author & Credits

Aroni is built by [Galanafai Windross](https://github.com/yourusername), a mission-driven engineer building traceable infrastructure for the real world.


