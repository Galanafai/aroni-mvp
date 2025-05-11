import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MetadataForm from './components/MetadataForm';
import ScanSubmission from './pages/ScanSubmission';
import Dashboard from './pages/Dashboard';

import ScanHistoryLookup from './pages/ScanHistoryLookup';
// import ScanHistoryLookup from './pages/ScanHistoryLookup'; // coming soon

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit-metadata" element={<MetadataForm />} />
        <Route path="/submit-scan" element={<ScanSubmission />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan-history" element={<ScanHistoryLookup />} />

        {/* <Route path="/scan-history" element={<ScanHistoryLookup />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
