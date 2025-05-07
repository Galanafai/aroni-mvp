import React, { useEffect, useState } from 'react';

type ScanLog = {
  tracking_id: string;
  scan_time: string;
  location: string;
  scanned_quantity: number;
  scanned_weight_kg: number;
  scanned_dimensions: [number, number, number];
  result: 'match' | 'mismatch';
  scan_hash: string | null;
  notes: string;
};

const Dashboard: React.FC = () => {
  const [scans, setScans] = useState<ScanLog[]>([]);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Aroni Scan Log Dashboard</h1>

      {loading ? (
        <p>Loading scan logs...</p>
      ) : scans.length === 0 ? (
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
                <th className="p-2 text-left">Weight (kg)</th>
                <th className="p-2 text-left">Dimensions</th>
                <th className="p-2 text-left">Anchored</th>
                <th className="p-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.tracking_id + scan.scan_time} className="border-t">
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
                  <td className="p-2 text-blue-600 cursor-pointer hover:underline">
                    {scan.tracking_id}
                  </td>
                  <td className="p-2">{scan.location}</td>
                  <td className="p-2">{scan.scanned_quantity}</td>
                  <td className="p-2">{scan.scanned_weight_kg.toFixed(2)}</td>
                  <td className="p-2">
                    {scan.scanned_dimensions.join(' × ')} cm
                  </td>
                  <td className="p-2">
                    {scan.scan_hash ? (
                      <span className="text-green-600">✔️ Anchored</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </td>
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(scan.scan_time).toLocaleString()}
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

export default Dashboard;
