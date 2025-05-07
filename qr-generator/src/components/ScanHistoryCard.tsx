import React from 'react';
import { ScanData } from '@/types/scan';

interface Props {
  scan: ScanData;
}

const ScanHistoryCard: React.FC<Props> = ({ scan }) => {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white mb-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Scan @ {scan.location}</h3>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            scan.result === 'match' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {scan.result.toUpperCase()}
        </span>
      </div>

      <div className="text-sm text-gray-600 mt-2">
        <p><strong>Time:</strong> {new Date(scan.scan_time).toLocaleString()}</p>
        <p><strong>Tracking ID:</strong> {scan.tracking_id}</p>
        <p><strong>Quantity:</strong> {scan.scanned_quantity}</p>
        <p><strong>Weight:</strong> {scan.scanned_weight_kg} kg</p>
        <p><strong>Dimensions:</strong> {scan.scanned_dimensions.join(' x ')} cm</p>
        {scan.notes && <p><strong>Notes:</strong> {scan.notes}</p>}
        {scan.scan_hash && <p><strong>Scan Hash:</strong> {scan.scan_hash}</p>}
      </div>
    </div>
  );
};

export default ScanHistoryCard;
