# Aroni MVP Interview Architecture Notes

## 1) One-line explanation
Aroni is a package scan integrity and traceability MVP. The frontend collects package metadata and scan submissions, the Go backend validates scans against stored metadata, logs the result, hashes each scan record, and batches scan hashes into a Merkle tree so individual scans can later be proven as part of a tamper-evident audit trail.

## 2) Core stack
- Frontend: React + Vite
- Backend: Go + Echo
- Storage: Supabase via REST
- Integrity layer: SHA-256 + Merkle tree proofs

## 3) Architecture by layer
### Frontend
Responsible for operator workflows:
- package metadata submission
- scan submission
- dashboard / scan history viewing

### Go backend
Responsible for trusted server-side logic:
- receive API requests
- validate payloads
- fetch expected metadata from Supabase
- compare expected vs observed values
- classify scans as match or mismatch
- store scan logs
- hash scan logs
- build / serve Merkle proof data

### Storage layer
Supabase stores:
- package metadata
- scan logs
- anchor batch records

### Integrity layer
- Each finalized scan log is hashed with SHA-256
- Scan hashes are grouped into a Merkle tree
- The Merkle root acts as a compact commitment to a batch of scans
- A proof can show that one scan belonged to that batch

## 4) End-to-end flow
1. Operator creates package metadata
2. System generates a tracking ID and QR label
3. Metadata is stored through the backend
4. Package is scanned later in the flow
5. Frontend sends tracking ID plus observed values to Go backend
6. Backend fetches expected metadata
7. Backend compares observed vs expected values
8. Backend returns match or mismatch and logs reasons
9. Backend hashes the scan record
10. Scan hashes can be batched into a Merkle tree for audit proofs

## 5) What Go is doing
Go is the backend brain of Aroni.

It is not the UI and not the database.
It is the trusted layer that:
- runs validation logic
- decides match vs mismatch
- protects integrity-sensitive logic from living in the browser
- exposes API endpoints for scans, history, and proofs

## 6) Where SHA logic is
### Per-scan SHA-256
File: `backend-api/internal/handlers/scan.go`

Function: `computeScanHash(payload map[string]interface{}) string`

Purpose:
- serialize the finalized scan log
- hash it with SHA-256
- store the resulting `scan_hash`

### Merkle hashing
File: `backend-api/internal/crypto/merkle.go`

Purpose:
- take many `scan_hash` values
- hash them together up the tree
- compute the Merkle root
- generate inclusion proofs
- verify proofs

## 7) Best concise interview answer
Aroni is built as a layered MVP. React handles operator workflows, Go owns the business and integrity logic, Supabase stores the records, and SHA-256 plus Merkle trees make the scan history tamper-evident. A package gets a tracking ID and QR label, scans are checked against canonical metadata on the backend, and each scan is hashed so it can later be included in an auditable proof set.

## 8) Honest limitations / tradeoffs
- Validation is still MVP-level and uses direct comparisons where production would likely use tolerances
- Proof generation is simple and should evolve into immutable stored batch definitions
- Supabase REST was chosen for speed and simplicity, not as the final large-scale architecture
- The README mentions a Python QR utility, but the core implemented system is really React + Go + Supabase

## 9) If asked why this architecture
I wanted the MVP to be simple but trustworthy. The frontend handles workflows, the backend owns correctness, the database stores operational records, and the cryptographic layer provides auditability. That gives me a system that is easy to demo but already structured around trust and traceability instead of just CRUD.

## 10) Fast answers to likely questions
### What does Go do?
Go is the backend service layer. It accepts metadata and scan events, validates them, fetches canonical records, decides match vs mismatch, logs the result, hashes scan records, and serves proof/history endpoints.

### Where is the SHA logic?
The individual scan SHA logic is in `backend-api/internal/handlers/scan.go`, and the batch Merkle hashing logic is in `backend-api/internal/crypto/merkle.go`.

### Where is Python?
The README references a Python QR helper, but the current core MVP implementation is mainly React + Go + Supabase.

### Why not do everything in the frontend?
Because the trust-sensitive logic should live on the server, not in the browser. The backend is the trusted execution layer.
