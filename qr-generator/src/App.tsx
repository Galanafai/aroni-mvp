import React, { useState } from 'react';
import QRCode from 'react-qr-code';

function App() {
  const [formData, setFormData] = useState({
    sku: '',
    quantity: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    destination: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isComplete = Object.values(formData).every(val => val.trim() !== '');

  const qrPayload = JSON.stringify({
    sku: formData.sku,
    quantity: Number(formData.quantity),
    weight: Number(formData.weight),
    dimensions_cm: [
      Number(formData.length),
      Number(formData.width),
      Number(formData.height),
    ],
    destination: formData.destination,
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1>QR Metadata Generator</h1>
      <form style={{ display: 'flex', flexDirection: 'column', maxWidth: 400, gap: '0.5rem' }}>
        <input name="sku" placeholder="SKU" onChange={handleChange} />
        <input name="quantity" placeholder="Quantity" onChange={handleChange} />
        <input name="weight" placeholder="Weight (kg)" onChange={handleChange} />
        <input name="length" placeholder="Length (cm)" onChange={handleChange} />
        <input name="width" placeholder="Width (cm)" onChange={handleChange} />
        <input name="height" placeholder="Height (cm)" onChange={handleChange} />
        <input name="destination" placeholder="Destination" onChange={handleChange} />
      </form>

      {isComplete && (
        <div style={{ marginTop: '2rem', background: 'white', padding: '1rem', display: 'inline-block' }}>
          <QRCode value={qrPayload} size={200} />
          <pre style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}>
            {qrPayload}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
