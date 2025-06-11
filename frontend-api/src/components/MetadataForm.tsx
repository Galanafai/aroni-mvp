import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';

const MetadataForm: React.FC = () => {
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
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setTrackingId(uuidv4());
    setTimestamp(new Date().toISOString());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (['length', 'width', 'height'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        dimensions_cm: { ...prev.dimensions_cm, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const payload = {
    sku: formData.sku,
    quantity: Number(formData.quantity),
    weight_kg: Number(formData.weight_kg),
    dimensions_cm: [
      Number(formData.dimensions_cm.length),
      Number(formData.dimensions_cm.width),
      Number(formData.dimensions_cm.height),
    ],
    package_type: formData.package_type,
    source_id: formData.source_id,
    destination_id: formData.destination_id,
    carrier_id: formData.carrier_id,
    urgency_level: formData.urgency_level,
    hs_code: formData.hs_code,
    nested_within: formData.nested_within,
    tracking_id: trackingId,
    timestamp,
  };

  const handleSubmit = async () => {
    setStatus(null);

    try {
      const res = await fetch('http://localhost:8080/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Submission failed');

      setStatus('✅ Metadata submitted!');
      console.log('📦 Metadata:', payload);

      // Reload to reset form with new UUID
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Submit Metadata</h1>

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

      <p style={{ marginTop: '1rem' }}>
        Tracking ID: <code>{trackingId}</code>
      </p>

      <div style={{ marginTop: '2rem' }}>
        <QRCode value={JSON.stringify(payload)} size={256} />
        <pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleSubmit}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#1f7', border: 'none', borderRadius: 4 }}
      >
        Submit Metadata to Backend
      </button>

      {status && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold', color: status.startsWith('✅') ? 'green' : 'red' }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default MetadataForm;
