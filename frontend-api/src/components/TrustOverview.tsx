// frontend/components/TrustOverview.tsx
import React from 'react';

type Props = {
  total: number;
  matches: number;
  mismatches: number;
  anchored: number;
  lastAnchorTime?: string;
};

const TrustOverview: React.FC<Props> = ({ total, matches, mismatches, anchored, lastAnchorTime }) => {
  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white space-y-2">
      <h2 className="text-lg font-bold">🔒 Trust Overview</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>Total Twins:</strong> {total}</div>
        <div><strong>Anchored:</strong> {anchored}</div>
        <div><strong>Matches:</strong> {matches}</div>
        <div><strong>Mismatches:</strong> {mismatches}</div>
      </div>
      {lastAnchorTime && (
        <p className="text-xs text-gray-500">Last Anchor: {lastAnchorTime}</p>
      )}
    </div>
  );
};

export default TrustOverview;
