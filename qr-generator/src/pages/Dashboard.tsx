// src/pages/Dashboard.tsx

import { useEffect, useState } from 'react';
import { getScans } from '@/lib/api'; // ✅ Not fetchScanHistory
import { ScanData } from '@/types/scan';
import ScanHistoryCard from '@/components/ScanHistoryCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [scans, setScans] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScans = async () => {
      try {
        const data = await getScans(); // ✅ Fetches all scan entries
        console.log("🧠 [Dashboard] Scans loaded:", data);
        setScans(data);
      } catch (error) {
        console.error('❌ Failed to fetch scans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scan History</h1>
        <Link to="/submit-scan">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            + New Scan
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : scans.length === 0 ? (
        <p className="text-gray-600">No scans found.</p>
      ) : (
        <div className="space-y-4">
          {scans.map((scan, index) => (
            <ScanHistoryCard key={index} scan={scan} />
          ))}
        </div>
      )}
    </div>
  );
}
