import requests, random, uuid, json, time
from datetime import datetime, timedelta

API = "http://localhost:8080"
HEADERS = {"Content-Type": "application/json"}
NUM_ENTRIES = 50

scan_hashes = []
tracking_ids = []

def rand_dimensions(): return [random.randint(10, 100) for _ in range(3)]

def generate_metadata(i):
    tracking_id = str(uuid.uuid4())
    meta = {
        "sku": f"SKU-{i:04}",
        "quantity": 50,
        "weight_kg": 20.0,
        "dimensions_cm": [50, 40, 30],
        "package_type": "box",
        "source_id": "SRC-LOC",
        "destination_id": "DEST-LOC",
        "carrier_id": "CARRIER-XYZ",
        "urgency_level": random.choice(["normal", "priority"]),
        "hs_code": "123456",
        "nested_within": f"PALLET-{i//10}",
        "tracking_id": tracking_id,
        "timestamp": (datetime.utcnow() - timedelta(hours=i)).isoformat() + "Z"
    }
    return meta, tracking_id

def generate_scan(tracking_id, mismatch=False):
    return {
        "tracking_id": tracking_id,
        "scanned_quantity": 50 if not mismatch else random.randint(40, 49),
        "scanned_weight_kg": 20.0 if not mismatch else round(random.uniform(18, 19.9), 1),
        "scanned_dimensions_cm": [50, 40, 30] if not mismatch else rand_dimensions(),
        "location": random.choice(["Port A", "Checkpoint B", "Warehouse C"])
    }

def main():
    for i in range(NUM_ENTRIES):
        metadata, tid = generate_metadata(i)
        tracking_ids.append(tid)
        res = requests.post(f"{API}/api/metadata", json=metadata, headers=HEADERS)
        print(f"[{i}] Metadata {tid[:8]}: {res.status_code}")

        for j in range(random.randint(1, 2)):
            scan = generate_scan(tid, mismatch=(j % 2 == 1))
            res = requests.post(f"{API}/api/scan", json=scan, headers=HEADERS)
            result = res.json()
            if "scan_hash" in result:
                scan_hashes.append(result["scan_hash"])
            print(f"   └─ Scan {j+1}: {res.status_code}")

    # Anchor batch
    time.sleep(1)
    res = requests.post(f"{API}/api/anchor-batch", headers={"Accept": "application/json"})
    batch_data = res.json()
    print(f"🔐 Anchored batch root: {batch_data.get('root_hash')} ({batch_data.get('scan_count')} scans)")

    # Get proofs
    proofs = []
    for h in scan_hashes:
        p = requests.get(f"{API}/api/proof/{h}")
        if p.ok:
            proofs.append(p.json())

    # Save files
    with open("scan_proofs.json", "w") as f:
        json.dump(proofs, f, indent=2)

    with open("scan_batches.json", "w") as f:
        json.dump(batch_data, f, indent=2)

    print("📁 Saved scan_proofs.json and scan_batches.json")

if __name__ == "__main__":
    main()
