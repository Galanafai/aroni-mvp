import React, { useState } from 'react';

const ScanSubmission: React.FC = () => {
  const [form, setForm] = useState({
    tracking_id: '',
    scanned_quantity: 0,
    scanned_weight_kg: 0,
    scanned_dimensions_cm: [0, 0, 0] as [number, number, number],
    location: '',
  });

  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('dim_')) {
      const index = parseInt(name.split('_')[1]);
      const dims = [...form.scanned_dimensions_cm] as [number, number, number];
      dims[index] = Number(value);
      setForm({ ...form, scanned_dimensions_cm: dims });
    } else if (name === 'scanned_quantity') {
      setForm({ ...form, scanned_quantity: parseInt(value) });
    } else if (name === 'scanned_weight_kg') {
      setForm({ ...form, scanned_weight_kg: parseFloat(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await fetch('http://localhost:8080/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to submit');

      setStatus(result.result === 'match'
        ? '✅ Scan matched successfully'
        : `⚠️ Mismatch: ${result.reasons?.join(', ')}`);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Submit Scan Result</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="tracking_id"
          placeholder="Scan or paste tracking ID"
          value={form.tracking_id}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />

        <input
          type="number"
          name="scanned_quantity"
          placeholder="Quantity"
          value={form.scanned_quantity}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <input
          type="number"
          step="0.1"
          name="scanned_weight_kg"
          placeholder="Weight (kg)"
          value={form.scanned_weight_kg}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <input
              key={i}
              type="number"
              name={`dim_${i}`}
              placeholder={['Length', 'Width', 'Height'][i] + ' (cm)'}
              value={form.scanned_dimensions_cm[i]}
              onChange={handleChange}
              className="flex-1 border p-2"
            />
          ))}
        </div>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Submit Scan
        </button>
      </form>

      {status && (
        <p className={`mt-4 font-medium ${status.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default ScanSubmission;
