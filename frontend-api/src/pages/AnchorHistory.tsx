// src/pages/AnchorHistory.tsx
import React, { useEffect, useState } from 'react';

type AnchorBatch = {
  merkle_root: string;
  scan_count: number;
  anchored_at: string;
};

const AnchorHistory: React.FC = () => {
  const [batches, setBatches] = useState<AnchorBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/anchor-batches')
      .then((res) => res.json())
      .then((data) => {
        setBatches(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch anchor history:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📚 Anchor Batch History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto rounded border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Merkle Root</th>
                <th className="p-2 text-left">Scan Count</th>
                <th className="p-2 text-left">Anchored At</th>
                <th className="p-2 text-left">OTS</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.merkle_root} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-mono">{batch.merkle_root.slice(0, 10)}...</td>
                  <td className="p-2">{batch.scan_count}</td>
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(batch.anchored_at).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() =>
                        window.open(`http://localhost:8080/api/ots/${batch.merkle_root}`, '_blank')
                      }
                      className="text-blue-600 underline text-xs"
                    >
                      ⬇️ Download .ots
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnchorHistory;
