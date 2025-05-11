import React, { useState } from 'react';

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

const ScanHistoryLookup: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!trackingId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8080/api/scan-history/${trackingId}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.history || []);
      } else {
        setError(data.error || 'Not found');
      }
    } catch (err: any) {
      setError('Error fetching scan history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Lookup Scan History</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter Tracking ID"
          className="border px-3 py-2 w-full"
        />
        <button
          onClick={fetchHistory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {logs.length > 0 && (
        <div className="mt-4 space-y-4">
          {logs.map((scan) => (
            <div key={scan.id} className="border p-4 rounded shadow-sm bg-white">
              <p><strong>Time:</strong> {new Date(scan.scan_time).toLocaleString()}</p>
              <p><strong>Location:</strong> {scan.location}</p>
              <p><strong>Result:</strong>{' '}
                <span className={`font-semibold ${scan.result === 'match' ? 'text-green-600' : 'text-red-600'}`}>
                  {scan.result.toUpperCase()}
                </span>
              </p>
              <p><strong>Quantity:</strong> {scan.scanned_quantity}</p>
              <p><strong>Weight (kg):</strong> {scan.scanned_weight_kg}</p>
              <p><strong>Dimensions:</strong> {scan.scanned_dimensions.join(' × ')} cm</p>
              <p><strong>Notes:</strong> {scan.notes || '—'}</p>
              <p><strong>Scan Hash:</strong> <code>{scan.scan_hash || '—'}</code></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScanHistoryLookup;
