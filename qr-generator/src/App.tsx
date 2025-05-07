import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import SubmitScan from '@/pages/SubmitScan';
import MetadataForm from '@/components/MetadataForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submit-scan" element={<SubmitScan />} />
        <Route path="/submit-metadata" element={<MetadataForm />} />
      </Routes>
    </Router>
  );
}

export default App;
