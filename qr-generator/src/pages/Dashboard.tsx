import React, { useEffect, useState } from 'react';

type ScanLog = {
  id: string;
  tracking_id: string;
  scan_time: string;
  location: string;
  scanned_quantity: number;
  scanned_weight_kg: number;
  scanned_dimensions: number[];
  result: 'match' | 'mismatch';
  scan_hash: string | null;
  notes: string;
};

const Dashboard: React.FC = () => {
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [filtered, setFiltered] = useState<ScanLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'match' | 'mismatch'>('all');
  const [selected, setSelected] = useState<ScanLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/scans');
        const data = await res.json();
        setScans(data.data || []);
      } catch (err) {
        console.error('Failed to fetch scan logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFiltered(scans);
    } else {
      setFiltered(scans.filter(s => s.result === filter));
    }
  }, [filter, scans]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📦 Aroni Scan Log Dashboard</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'match' | 'mismatch')}
          className="border px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="match">Matches</option>
          <option value="mismatch">Mismatches</option>
        </select>
      </div>

      {loading ? (
        <p>Loading scan logs...</p>
      ) : filtered.length === 0 ? (
        <p>No scans found.</p>
      ) : (
        <div className="overflow-auto rounded border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Result</th>
                <th className="p-2 text-left">Tracking ID</th>
                <th className="p-2 text-left">Location</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">Weight</th>
                <th className="p-2 text-left">Dimensions</th>
                <th className="p-2 text-left">Anchored</th>
                <th className="p-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((scan) => (
                <tr key={scan.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        scan.result === 'match'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {scan.result.toUpperCase()}
                    </span>
                  </td>
                  <td
                    className="p-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => setSelected(scan)}
                  >
                    {scan.tracking_id}
                  </td>
                  <td className="p-2">{scan.location}</td>
                  <td className="p-2">{scan.scanned_quantity}</td>
                  <td className="p-2">{scan.scanned_weight_kg.toFixed(2)}</td>
                  <td className="p-2">{scan.scanned_dimensions.join(' × ')} cm</td>
                  <td className="p-2">
                    {scan.scan_hash ? (
                      <span className="text-green-600">✔️</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-2 text-xs text-gray-500">
                    {new Date(scan.scan_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
          <div className="bg-white w-[400px] p-4 shadow-lg overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Scan Details</h2>
              <button onClick={() => setSelected(null)}>❌</button>
            </div>
            <div className="text-sm space-y-2">
              <p><strong>Tracking ID:</strong> {selected.tracking_id}</p>
              <p><strong>Result:</strong> {selected.result}</p>
              <p><strong>Location:</strong> {selected.location}</p>
              <p><strong>Qty:</strong> {selected.scanned_quantity}</p>
              <p><strong>Weight (kg):</strong> {selected.scanned_weight_kg}</p>
              <p><strong>Dimensions:</strong> {selected.scanned_dimensions.join(' × ')} cm</p>
              <p><strong>Notes:</strong> {selected.notes || '—'}</p>
              <p><strong>Scan Time:</strong> {new Date(selected.scan_time).toLocaleString()}</p>
              <p><strong>Scan Hash:</strong> <code>{selected.scan_hash || '—'}</code></p>
              {selected.scan_hash && (
            <div className="space-y-2">
              <p><strong>Scan Hash:</strong> <code>{selected.scan_hash}</code></p>
              <button
                onClick={async () => {
                  try {
                    const proofRes = await fetch(`http://localhost:8080/api/proof/${selected.scan_hash}`);
                    const proofData = await proofRes.json();
                    if (!proofRes.ok) throw new Error(proofData.error || 'Failed to get proof');

                    const verifyRes = await fetch(`http://localhost:8080/api/verify-scan`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        scan_hash: selected.scan_hash,
                        root_hash: proofData.root_hash,
                        proof: proofData.proof,
                      }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok && verifyData.valid) {
                      alert('✅ Scan proof verified!');
                    } else {
                      alert('❌ Scan proof is INVALID.');
                    }
                  } catch (err: any) {
                    alert('❌ Proof verification failed: ' + err.message);
                  }
                }}
                className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
              >
                Verify Proof
              </button>
            </div>
          )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
