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

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'aroni-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

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
          <QRCode id="qr-code" value={qrPayload} size={200} />
          <pre style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}>
            {qrPayload}
          </pre>
          <button onClick={downloadQR} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Download QR as PNG
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
