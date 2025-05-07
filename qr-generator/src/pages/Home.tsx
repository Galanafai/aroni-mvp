import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">🌐 Aroni App Navigation</h1>
      <ul className="space-y-4 text-left text-lg">
        <li>
          <Link to="/submit-metadata" className="text-blue-600 hover:underline">
            ➕ Submit Package Metadata (QR Generator)
          </Link>
        </li>
        <li>
          <Link to="/submit-scan" className="text-blue-600 hover:underline">
            ✅ Submit Scan Verification
          </Link>
        </li>
        <li>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            📊 View Scan Log Dashboard
          </Link>
        </li>
        <li>
          <Link to="/scan-history" className="text-blue-600 hover:underline">
            🔍 Lookup Scan History by Tracking ID
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
