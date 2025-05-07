/// File: src/pages/SubmitScan.tsx

import { useState } from 'react';
import { submitScan } from '@/lib/api';

export default function SubmitScan() {
  const [form, setForm] = useState({
    tracking_id: '',
    scanned_quantity: 0,
    scanned_weight_kg: 0,
    scanned_dimensions_cm: '', // comma-separated string
    location: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const dimensions = form.scanned_dimensions_cm
        .split(',')
        .map((d) => parseInt(d.trim(), 10));

      await submitScan({
        tracking_id: form.tracking_id,
        scanned_quantity: Number(form.scanned_quantity),
        scanned_weight_kg: Number(form.scanned_weight_kg),
        scanned_dimensions_cm: dimensions,
        location: form.location,
      });

      setStatus('✅ Scan submitted successfully!');
      setForm({ tracking_id: '', scanned_quantity: 0, scanned_weight_kg: 0, scanned_dimensions_cm: '', location: '' });
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message || 'Submission failed'}`);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Scan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="tracking_id" placeholder="Tracking ID" value={form.tracking_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        <input type="number" name="scanned_quantity" placeholder="Scanned Quantity" value={form.scanned_quantity} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        <input type="number" step="0.01" name="scanned_weight_kg" placeholder="Scanned Weight (kg)" value={form.scanned_weight_kg} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        <div className="flex gap-2">
  <input
    type="number"
    name="dim_0"
    placeholder="Length (cm)"
    value={form.scanned_dimensions_cm[0]}
    onChange={handleChange}
    className="flex-1 border p-2"
  />
  <input
    type="number"
    name="dim_1"
    placeholder="Width (cm)"
    value={form.scanned_dimensions_cm[1]}
    onChange={handleChange}
    className="flex-1 border p-2"
  />
  <input
    type="number"
    name="dim_2"
    placeholder="Height (cm)"
    value={form.scanned_dimensions_cm[2]}
    onChange={handleChange}
    className="flex-1 border p-2"
  />
</div>

        <input type="text" name="location" placeholder="Scan Location" value={form.location} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />

        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Submit</button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
