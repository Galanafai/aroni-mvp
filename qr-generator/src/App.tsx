import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [formData, setFormData] = useState({
    sku: '',
    quantity: '',
    weight_kg: '',
    dimensions_cm: { length: '', width: '', height: '' },
    package_type: 'case',
    source_id: '',
    destination_id: '',
    carrier_id: '',
    urgency_level: 'normal',
    hs_code: '',
    nested_within: '',
  });

  const [trackingId, setTrackingId] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTrackingId(uuidv4());
    setTimestamp(new Date().toISOString());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (['length', 'width', 'height'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        dimensions_cm: { ...prev.dimensions_cm, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const qrPayload = {
    ...formData,
    quantity: Number(formData.quantity) || 0,
    weight_kg: Number(formData.weight_kg) || 0,
    dimensions_cm: [
      Number(formData.dimensions_cm.length) || 0,
      Number(formData.dimensions_cm.width) || 0,
      Number(formData.dimensions_cm.height) || 0
    ],
    tracking_id: trackingId,
    timestamp
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrPayload),
      });
  
      if (!res.ok) {
        throw new Error('Failed to submit');
      }
  
      alert('✅ Metadata submitted to backend!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to submit metadata.');
    }
  };
  

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Aroni QR Metadata Generator</h1>

      <form style={{ display: 'grid', gap: '0.5rem', maxWidth: 600, marginTop: '1rem' }}>
        <input name="sku" placeholder="SKU" onChange={handleChange} />
        <input name="quantity" placeholder="Quantity" onChange={handleChange} />
        <input name="weight_kg" placeholder="Weight (kg)" onChange={handleChange} />
        <input name="length" placeholder="Length (cm)" onChange={handleChange} />
        <input name="width" placeholder="Width (cm)" onChange={handleChange} />
        <input name="height" placeholder="Height (cm)" onChange={handleChange} />
        <select name="package_type" onChange={handleChange}>
          <option value="unit">unit</option>
          <option value="case">case</option>
          <option value="pallet">pallet</option>
          <option value="box">box</option>
        </select>
        <input name="source_id" placeholder="Source Facility ID" onChange={handleChange} />
        <input name="destination_id" placeholder="Destination ID" onChange={handleChange} />
        <input name="carrier_id" placeholder="Carrier ID (optional)" onChange={handleChange} />
        <select name="urgency_level" onChange={handleChange}>
          <option value="normal">normal</option>
          <option value="priority">priority</option>
          <option value="critical">critical</option>
        </select>
        <input name="hs_code" placeholder="HS Code" onChange={handleChange} />
        <input name="nested_within" placeholder="Nested Within (optional)" onChange={handleChange} />
      </form>

      <div style={{ marginTop: '2rem' }}>
        <QRCode id="qr-code" value={JSON.stringify(qrPayload)} size={256} />
        <pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(qrPayload, null, 2)}
        </pre>
      </div>
      <button onClick={handleSubmit}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#1f7', border: 'none', borderRadius: 4 }}
        >
          Submit Metadata to Backend
        </button>
    </div>
    
  );
}

export default App;
