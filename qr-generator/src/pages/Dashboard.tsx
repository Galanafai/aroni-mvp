// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import TrustOverview from '../components/TrustOverview';

export type ScanLog = {
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

type TwinSummary = {
  tracking_id: string;
  total: number;
  matches: number;
  mismatches: number;
  anchored: number;
  last_seen: string;
  scans: ScanLog[];
};

function computeTwinSummaries(scans: ScanLog[]): TwinSummary[] {
  const summaries: Record<string, TwinSummary> = {};
  for (const scan of scans) {
    const id = scan.tracking_id;
    if (!summaries[id]) {
      summaries[id] = {
        tracking_id: id,
        total: 0,
        matches: 0,
        mismatches: 0,
        anchored: 0,
        last_seen: '',
        scans: [],
      };
    }
    const s = summaries[id];
    s.total++;
    if (scan.result === 'match') s.matches++;
    if (scan.result === 'mismatch') s.mismatches++;
    if (scan.scan_hash) s.anchored++;
    if (!s.last_seen || new Date(scan.scan_time) > new Date(s.last_seen)) {
      s.last_seen = scan.scan_time;
    }
    s.scans.push(scan);
  }
  return Object.values(summaries);
}

const TwinTimeline: React.FC<{ scans: ScanLog[] }> = ({ scans }) => {
  const ordered = [...scans].sort(
    (a, b) => new Date(a.scan_time).getTime() - new Date(b.scan_time).getTime()
  );

  return (
    <ul className="space-y-3 mt-4">
      {ordered.map((s, idx) => (
        <li
          key={s.id || idx}
          className={`border-l-4 pl-3 py-2 ${
            s.result === 'match' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          } rounded-md shadow-sm`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {s.result === 'match' ? '✔️ Match' : '❌ Mismatch'} – {s.location}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(s.scan_time).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Qty: {s.scanned_quantity}, Weight: {s.scanned_weight_kg} kg, Dim: {s.scanned_dimensions.join(' × ')} cm
          </div>
          <div className="text-xs mt-1">
            {s.scan_hash ? '🔗 Anchored' : '— Not Anchored'}
          </div>
        </li>
      ))}
    </ul>
  );
};

const Dashboard: React.FC = () => {
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'match' | 'mismatch'>('all');
  const [selected, setSelected] = useState<ScanLog | null>(null);
  const [lastAnchorTime, setLastAnchorTime] = useState<string | null>(null);
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

    const fetchAnchor = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/anchor-log');
        const data = await res.json();
        if (res.ok) setLastAnchorTime(data.anchored_at);
      } catch (err) {
        console.warn('Failed to fetch anchor log:', err);
      }
    };

    fetchScans();
    fetchAnchor();
  }, []);

  const filtered = filter === 'all' ? scans : scans.filter(s => s.result === filter);
  const twinSummaries = computeTwinSummaries(filtered);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📦 Aroni Digital Twin Dashboard</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="match">Matches</option>
          <option value="mismatch">Mismatches</option>
        </select>
      </div>

      <TrustOverview
        total={scans.length}
        matches={scans.filter(s => s.result === 'match').length}
        mismatches={scans.filter(s => s.result === 'mismatch').length}
        anchored={scans.filter(s => s.scan_hash).length}
        lastAnchorTime={lastAnchorTime || '—'}
      />

      {loading ? (
        <p>Loading scan logs...</p>
      ) : (
        <div className="overflow-auto rounded border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Twin ID</th>
                <th className="p-2 text-left">Scans</th>
                <th className="p-2 text-left">Match</th>
                <th className="p-2 text-left">Mismatch</th>
                <th className="p-2 text-left">Anchored</th>
                <th className="p-2 text-left">Last Seen</th>
                <th className="p-2 text-left">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {twinSummaries.map((twin) => (
                <tr key={twin.tracking_id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{twin.tracking_id}</td>
                  <td className="p-2">{twin.total}</td>
                  <td className="p-2">{twin.matches}</td>
                  <td className="p-2">{twin.mismatches}</td>
                  <td className="p-2">{twin.anchored}</td>
                  <td className="p-2 text-xs text-gray-500">{new Date(twin.last_seen).toLocaleString()}</td>
                  <td className="p-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelected(twin.scans[twin.scans.length - 1])}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
          <div className="bg-white w-[500px] p-6 shadow-lg overflow-auto max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Digital Twin Timeline</h2>
              <button onClick={() => setSelected(null)} className="text-lg">❌</button>
            </div>
            <TwinTimeline scans={scans.filter(s => s.tracking_id === selected.tracking_id)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
